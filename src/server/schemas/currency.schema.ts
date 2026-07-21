import { z } from 'zod';

export const GetExchangeRateSchema = z.object({
  from: z.string().length(3, 'From currency must be a 3-character ISO code').transform((val) => val.toUpperCase()),
  to: z.string().length(3, 'To currency must be a 3-character ISO code').transform((val) => val.toUpperCase()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

export type GetExchangeRateInput = z.infer<typeof GetExchangeRateSchema>;
