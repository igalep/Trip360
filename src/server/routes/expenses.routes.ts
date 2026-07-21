import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { CreateExpenseSchema, UpdateExpenseSchema } from '../schemas/expense.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import { CurrencyService } from '../services/currency.service';
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

    // Verify trip exists by ID, Name, or Slug and fetch base_currency
    const tripResult = await db.execute({
      sql: `SELECT id, base_currency FROM trips WHERE id = ? OR LOWER(name) = LOWER(?) OR LOWER(REPLACE(name, ' ', '-')) = LOWER(?)`,
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
    const tripBaseCurrency = String(tripResult.rows[0].base_currency || 'USD');

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

    let rate = conversion_rate;
    if (rate === undefined || rate === null) {
      const rateInfo = await CurrencyService.getExchangeRate(original_currency, tripBaseCurrency, date);
      rate = rateInfo.rate;
    }

    const calculatedAmount = amount !== undefined && amount !== null ? Number(amount) : Number((Number(original_amount) * Number(rate)).toFixed(2));

    await db.execute({
      sql: `INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        String(id), 
        realTripId, 
        realCategoryId, 
        calculatedAmount, 
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
        amount: calculatedAmount,
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

// PUT /api/expenses/:id - Update an expense (e.g. modify conversion rate or amounts later)
router.put('/:id', validateRequest({ body: UpdateExpenseSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const selectResult = await db.execute({
      sql: 'SELECT * FROM expenses WHERE id = ?',
      args: [String(id)],
    });
    
    if (selectResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Expense not found',
      });
      return;
    }

    const current = selectResult.rows[0];
    const {
      category_id, amount, original_amount, original_currency,
      conversion_rate, payment_method, description, date
    } = req.body;

    const newRate = conversion_rate !== undefined ? Number(conversion_rate) : Number(current.conversion_rate);
    const newOrigAmount = original_amount !== undefined ? Number(original_amount) : Number(current.original_amount);
    const newAmount = amount !== undefined ? Number(amount) : Number((newOrigAmount * newRate).toFixed(2));
    const newOrigCurrency = original_currency !== undefined ? String(original_currency) : String(current.original_currency);
    const newCategoryId = category_id !== undefined ? String(category_id) : String(current.category_id);
    const newPaymentMethod = payment_method !== undefined ? String(payment_method) : String(current.payment_method);
    const newDesc = description !== undefined ? String(description) : (current.description ? String(current.description) : null);
    const newDate = date !== undefined ? String(date) : String(current.date);

    await db.execute({
      sql: `UPDATE expenses SET category_id = ?, amount = ?, original_amount = ?, original_currency = ?, conversion_rate = ?, payment_method = ?, description = ?, date = ? WHERE id = ?`,
      args: [
        newCategoryId,
        newAmount,
        newOrigAmount,
        newOrigCurrency,
        newRate,
        newPaymentMethod,
        newDesc,
        newDate,
        String(id),
      ],
    });

    res.json({
      status: 'success',
      data: {
        id,
        trip_id: current.trip_id,
        category_id: newCategoryId,
        amount: newAmount,
        original_amount: newOrigAmount,
        original_currency: newOrigCurrency,
        conversion_rate: newRate,
        payment_method: newPaymentMethod,
        description: newDesc,
        date: newDate,
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
