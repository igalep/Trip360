import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { CreateTripSchema } from '../schemas/trip.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import crypto from 'crypto';

const router = Router();

// Helper to determine destination cover illustration
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

// POST /api/trips - Create new trip & seed default categories
router.post('/', validateRequest({ body: CreateTripSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, destination, start_date, end_date, budget_limit, base_currency } = req.body;
    
    const id = crypto.randomUUID();
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const imageUrl = getDestinationImage(destination);
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

export default router;
