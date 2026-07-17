import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  trip_id: z.string().min(1, 'Trip ID is required'),
  category_id: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  original_amount: z.number().positive('Original amount must be positive'),
  original_currency: z.string().length(3, 'Original currency must be a 3-character code'),
  conversion_rate: z.number().positive('Conversion rate must be positive').optional().default(1.0),
  payment_method: z.enum(['card', 'cash']),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
