import 'dotenv/config';
import app from './server';
import { initLoaders, stopLoaders } from './loaders';
import { logger } from '../utils/logger';

const PORT = Number(process.env.PORT) || 3001;

async function bootstrap() {
  try {
    // If not on Vercel, initialize everything and start the listener
    if (!process.env.VERCEL) {
      logger.animation('INITIALIZING BUDGET CONTROL SERVER');
      await initLoaders({ app });

      const server = app.listen(PORT, '0.0.0.0', () => {
        logger.animation(`SERVER RUNNING ON PORT ${PORT}`);
      });

      // Graceful shutdown handlers
      const shutdown = (signal: string) => {
        logger.info(`${signal} received. Shutting down gracefully...`);

        // Stop background jobs first
        stopLoaders();

        server.close(() => {
          logger.info('HTTP server closed.');
          process.exit(0);
        });

        // Safety timeout
        setTimeout(() => {
          logger.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    }
  } catch (error) {
    logger.error('Failed to bootstrap server:', error);
    process.exit(1);
  }
}

// Start the bootstrap process
bootstrap();

/**
 * Vercel Serverless Function Handler
 * Vercel calls this exported function for incoming requests.
 */
export default async (req: any, res: any) => {
  try {
    await initLoaders({ app });
    return app(req, res);
  } catch (error) {
    logger.error('Vercel handler initialization failed:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
