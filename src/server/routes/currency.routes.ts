import { Router, Request, Response, NextFunction } from 'express';
import { GetExchangeRateSchema } from '../schemas/currency.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import { CurrencyService } from '../services/currency.service';

const router = Router();

// GET /api/currencies/rate?from=USD&to=ILS&date=YYYY-MM-DD
router.get('/rate', validateRequest({ query: GetExchangeRateSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to, date } = req.query as { from: string; to: string; date?: string };
    
    const result = await CurrencyService.getExchangeRate(from, to, date);

    res.json({
      status: 'success',
      data: {
        from,
        to,
        rate: result.rate,
        date: result.date,
        source: result.source,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
