import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { CreateTripSchema } from '../schemas/trip.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import crypto from 'crypto';
import { z } from 'zod';
import { logger } from '../../utils/logger';

const router = Router();

// Helper to determine destination cover illustration fallback
const getDestinationImage = (destination: string): string => {
  const destLower = destination.toLowerCase();
  if (destLower.includes('baku')) return '/assets/destinations/baku.png';
  if (destLower.includes('georgia')) return '/assets/destinations/georgia.png';
  if (destLower.includes('budapest')) return '/assets/destinations/budapest.png';
  if (destLower.includes('london')) return '/assets/destinations/london.png';
  if (destLower.includes('paris')) return '/assets/destinations/paris.png';
  if (destLower.includes('new york')) return '/assets/destinations/newyork.png';
  return '/assets/destinations/default.png';
};

// Async helper to search and retrieve a real photo from Wikipedia
const fetchDestinationImage = async (destination: string): Promise<string> => {
  try {
    const query = encodeURIComponent(destination.split(',')[0].trim());
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&prop=pageimages&format=json&pithumbsize=600&gsrlimit=1`;
    
    const res = await fetch(url);
    const json = await res.json();
    
    if (json.query && json.query.pages) {
      const pages = json.query.pages;
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId].thumbnail;
      if (thumbnail && thumbnail.source) {
        return thumbnail.source;
      }
    }
  } catch (error) {
    logger.error('Failed to fetch destination image from Wikipedia:', error);
  }
  return getDestinationImage(destination);
};

// GET /api/trips - List all trips with total spent
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await db.execute(`
      SELECT 
        id, 
        name, 
        destination, 
        start_date, 
        end_date, 
        nights, 
        base_currency, 
        budget_limit, 
        image_url,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expenses.trip_id = trips.id) as total_spent
      FROM trips
    `);
    
    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trips/:id - Retrieve trip details with categories and expenses
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tripResult = await db.execute({
      sql: 'SELECT id, name, destination, start_date, end_date, nights, base_currency, budget_limit, image_url FROM trips WHERE id = ?',
      args: [String(id)],
    });
    
    if (tripResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Trip not found',
      });
      return;
    }
    
    const categoriesResult = await db.execute({
      sql: 'SELECT id, trip_id, name, icon, group_name, is_default FROM categories WHERE trip_id = ?',
      args: [String(id)],
    });
    
    const expensesResult = await db.execute({
      sql: `SELECT 
              e.id, e.trip_id, e.category_id, e.amount, e.original_amount, 
              e.original_currency, e.conversion_rate, e.payment_method, 
              e.description, e.date, c.name as category_name, c.icon as category_icon, c.group_name as category_group
            FROM expenses e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.trip_id = ?`,
      args: [String(id)],
    });
    
    res.json({
      status: 'success',
      data: {
        trip: tripResult.rows[0],
        categories: categoriesResult.rows,
        expenses: expensesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/trips - Create new trip & seed default categories
router.post('/', validateRequest({ body: CreateTripSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, destination, start_date, end_date, budget_limit, base_currency } = req.body;
    
    const id = crypto.randomUUID();
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const imageUrl = await fetchDestinationImage(destination);
    const budgetLimitVal = budget_limit ?? 1000.0;
    const baseCurrencyVal = base_currency ?? 'USD';

    // Default categories to seed
    const defaultCategories = [
      { id: crypto.randomUUID(), name: 'Flight', icon: 'flight', group_name: 'fixed' },
      { id: crypto.randomUUID(), name: 'Accommodation', icon: 'accommodation', group_name: 'fixed' },
      { id: crypto.randomUUID(), name: 'Transportation', icon: 'transport', group_name: 'transit' },
      { id: crypto.randomUUID(), name: 'Restaurants', icon: 'restaurants', group_name: 'living' },
      { id: crypto.randomUUID(), name: 'Shopping', icon: 'shopping', group_name: 'leisure' },
      { id: crypto.randomUUID(), name: 'Misc', icon: 'misc', group_name: 'leisure' },
    ];

    // Build batch operations
    const statements = [
      {
        sql: `INSERT INTO trips (id, name, destination, start_date, end_date, nights, base_currency, budget_limit, image_url) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, name, destination, start_date, end_date, nights, baseCurrencyVal, budgetLimitVal, imageUrl],
      },
      ...defaultCategories.map((cat) => ({
        sql: `INSERT INTO categories (id, trip_id, name, icon, group_name, is_default) 
              VALUES (?, ?, ?, ?, ?, 1)`,
        args: [cat.id, id, cat.name, cat.icon, cat.group_name],
      })),
    ];

    // Execute in transaction
    await db.batch(statements, 'write');

    res.status(201).json({
      status: 'success',
      data: {
        id,
        name,
        destination,
        start_date,
        end_date,
        nights,
        base_currency: baseCurrencyVal,
        budget_limit: budgetLimitVal,
        image_url: imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:id/categories - Create custom category/section
const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Category icon is required'),
});

router.post('/:id/categories', validateRequest({ body: CreateCategorySchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    
    // Verify trip exists
    const tripResult = await db.execute({
      sql: 'SELECT id FROM trips WHERE id = ?',
      args: [String(id)],
    });
    
    if (tripResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Trip not found',
      });
      return;
    }
    
    const catId = crypto.randomUUID();
    
    await db.execute({
      sql: 'INSERT INTO categories (id, trip_id, name, icon, group_name, is_default) VALUES (?, ?, ?, ?, ?, 0)',
      args: [catId, String(id), name, icon, 'custom'],
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        id: catId,
        trip_id: id,
        name,
        icon,
        group_name: 'custom',
        is_default: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
