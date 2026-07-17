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
    
    // Verify trip exists
    const tripResult = await db.execute({
      sql: 'SELECT id FROM trips WHERE id = ?',
      args: [String(trip_id)],
    });
    
    if (tripResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Trip not found',
      });
      return;
    }

    // Verify category exists
    const categoryResult = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ? AND trip_id = ?',
      args: [String(category_id), String(trip_id)],
    });
    
    if (categoryResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Category not found for this trip',
      });
      return;
    }

    const id = crypto.randomUUID();
    const rate = conversion_rate ?? 1.0;
    
    await db.execute({
      sql: `INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        String(id), 
        String(trip_id), 
        String(category_id), 
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
        trip_id,
        category_id,
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
