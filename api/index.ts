import app from '../src/server/server';
import { initLoaders } from '../src/server/loaders';
import { logger } from '../src/utils/logger';

export default async (req: any, res: any) => {
  try {
    await initLoaders({ app });
    return app(req, res);
  } catch (error) {
    logger.error('Vercel handler initialization failed:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
