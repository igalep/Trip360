import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from './db';
import { logger } from '../utils/logger';

async function init() {
  try {
    logger.info('Initializing database schema...');
    const schemaPath = join(process.cwd(), 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    await db.executeMultiple(schemaSql);
    logger.info('Database schema initialized successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
}

init();
