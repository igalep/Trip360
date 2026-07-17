import express from 'express';
import cors from 'cors';
import tripsRouter from '../routes/trips.routes';
import expensesRouter from '../routes/expenses.routes';
import { logger } from '../../utils/logger';

export default async function expressLoader({ app }: { app: express.Application }) {
  app.use(cors());
  app.use(express.json());

  app.use('/api/trips', tripsRouter);
  app.use('/api/expenses', expensesRouter);

  // Default health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Global error handler middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Server Error:', err);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    });
  });

  logger.info('Express loader: Middlewares and routes initialized.');
}
