import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const rawUrl = process.env.TURSO_DATABASE_URL;
const rawToken = process.env.TURSO_AUTH_TOKEN;

if (!rawUrl) {
  throw new Error('TURSO_DATABASE_URL environment variable is missing in .env');
}

// Strip any enclosing quotes from environment variables
const url = rawUrl.replace(/^['"]|['"]$/g, '');
const authToken = rawToken ? rawToken.replace(/^['"]|['"]$/g, '') : undefined;

export const db = createClient({
  url,
  authToken,
});
