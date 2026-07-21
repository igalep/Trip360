import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../db';
import { logger } from '../../utils/logger';

export default async function dbLoader() {
  try {
    // Verify SQLite/Turso database connection
    await db.execute('SELECT 1');
    logger.info('Database loader: Connection verified successfully.');

    // Ensure schema tables exist
    const checkTable = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='trips'");
    if (checkTable.rows.length === 0) {
      logger.info('Database loader: Schema tables missing. Initializing schema.sql...');
      const schemaPath = join(process.cwd(), 'schema.sql');
      const schemaSql = readFileSync(schemaPath, 'utf8');
      await db.executeMultiple(schemaSql);
      logger.info('Database loader: Schema initialized successfully.');
    }
  } catch (error) {
    logger.error('Database loader: Connection or schema initialization failed:', error);
    throw error;
  }
}
