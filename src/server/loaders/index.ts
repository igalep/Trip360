import express from 'express';
import dbLoader from './db';
import expressLoader from './express';

export async function initLoaders({ app }: { app: express.Application }) {
  // Initialize Database Loader
  await dbLoader();

  // Initialize Express Middleware and Routes Loader
  await expressLoader({ app });
}

export function stopLoaders() {
  // Graceful loader cleanup if needed
}
