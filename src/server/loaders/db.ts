import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../db';
import { logger } from '../../utils/logger';

export default async function dbLoader() {
  try {
    // Verify Turso Cloud database connection
    await db.execute('SELECT 1');
    logger.info('Database loader: Turso Cloud database connection verified successfully.');

    // 1. Ensure users & sessions tables exist
    const checkTable = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (checkTable.rows.length === 0) {
      logger.info('Database loader: Users table missing. Initializing schema.sql...');
      const schemaPath = join(process.cwd(), 'schema.sql');
      const schemaSql = readFileSync(schemaPath, 'utf8');
      await db.executeMultiple(schemaSql);
      logger.info('Database loader: Schema initialized successfully.');
    }

    // 2. Ensure trips table has user_id column
    const checkTripsTable = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='trips'");
    if (checkTripsTable.rows.length > 0) {
      const checkTripsColumn = await db.execute("PRAGMA table_info(trips)");
      const hasUserId = checkTripsColumn.rows.some((row) => String(row.name) === 'user_id');
      if (!hasUserId) {
        logger.info('Database loader: Migrating trips table (adding user_id column)...');
        await db.execute("ALTER TABLE trips ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE");
        logger.info('Database loader: Migrated trips table successfully.');
      }
    }
  } catch (error) {
    logger.error('Database loader: Connection or schema initialization failed:', error);
    throw error;
  }
}
