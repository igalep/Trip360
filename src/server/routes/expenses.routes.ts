import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { CreateExpenseSchema } from '../schemas/expense.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import crypto from 'crypto';

const router = Router();

// POST /api/expenses - Log an expense
router.post('/', validateRequest({ body: CreateExpenseSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      trip_id, category_id, amount, original_amount, 
      original_currency, conversion_rate, payment_method, description, date 
    } = req.body;
    
    const tripIdentifier = String(trip_id).trim();
    const decodedTripIdentifier = decodeURIComponent(tripIdentifier);

    // Verify trip exists by ID, Name, or Slug
    const tripResult = await db.execute({
      sql: `SELECT id FROM trips WHERE id = ? OR LOWER(name) = LOWER(?) OR LOWER(REPLACE(name, ' ', '-')) = LOWER(?)`,
      args: [tripIdentifier, decodedTripIdentifier, decodedTripIdentifier],
    });
    
    if (tripResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Trip not found',
      });
      return;
    }

    const realTripId = String(tripResult.rows[0].id);

    // Verify category exists by ID or Name
    const categoryIdentifier = String(category_id).trim();
    const decodedCategoryIdentifier = decodeURIComponent(categoryIdentifier);

    const categoryResult = await db.execute({
      sql: `SELECT id FROM categories WHERE (id = ? OR LOWER(name) = LOWER(?)) AND trip_id = ?`,
      args: [categoryIdentifier, decodedCategoryIdentifier, realTripId],
    });
    
    if (categoryResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Category not found for this trip',
      });
      return;
    }

    const realCategoryId = String(categoryResult.rows[0].id);
    const id = crypto.randomUUID();
    const rate = conversion_rate ?? 1.0;
    
    await db.execute({
      sql: `INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        String(id), 
        realTripId, 
        realCategoryId, 
        Number(amount), 
        Number(original_amount), 
        String(original_currency), 
        Number(rate), 
        String(payment_method), 
        description ? String(description) : null, 
        String(date)
      ],
    });

    res.status(201).json({
      status: 'success',
      data: {
        id,
        trip_id: realTripId,
        category_id: realCategoryId,
        amount,
        original_amount,
        original_currency,
        conversion_rate: rate,
        payment_method,
        description,
        date,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const selectResult = await db.execute({
      sql: 'SELECT id FROM expenses WHERE id = ?',
      args: [String(id)],
    });
    
    if (selectResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Expense not found',
      });
      return;
    }

    await db.execute({
      sql: 'DELETE FROM expenses WHERE id = ?',
      args: [String(id)],
    });
    
    res.json({
      status: 'success',
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
