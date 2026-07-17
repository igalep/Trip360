import { db } from '../db';
import { logger } from '../../utils/logger';

export default async function dbLoader() {
  try {
    // Verify SQLite/Turso database connection
    await db.execute('SELECT 1');
    logger.info('Database loader: Connection verified successfully.');
  } catch (error) {
    logger.error('Database loader: Connection failed:', error);
    throw error;
  }
}
