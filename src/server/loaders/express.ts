import express from 'express';
import cors from 'cors';
import path from 'path';
import tripsRouter from '../routes/trips.routes';
import expensesRouter from '../routes/expenses.routes';
import currencyRouter from '../routes/currency.routes';
import { logger } from '../../utils/logger';

export default async function expressLoader({ app }: { app: express.Application }) {
  app.use(cors());
  app.use(express.json());

  app.use('/api/trips', tripsRouter);
  app.use('/api/expenses', expensesRouter);
  app.use('/api/currencies', currencyRouter);

  // Default health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Serve static assets from frontend build directory in production
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));

  // SPA fallback routing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        // Safe fallback if build doesn't exist
        next();
      }
    });
  });

  // Global error handler middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Server Error:', err);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    });
  });

  logger.info('Express loader: Middlewares and routes initialized.');
}
