import { z } from 'zod';

export const CreateTripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  destination: z.string().min(1, 'Destination is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  budget_limit: z.number().positive().optional(),
  base_currency: z.string().length(3).optional().default('USD'),
  image_url: z.string().optional(),
  user_id: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;
