import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from './db';

async function init() {
  try {
    console.log('Initializing database schema...');
    const schemaPath = join(process.cwd(), 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    await db.executeMultiple(schemaSql);
    console.log('Database schema initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
}

init();
