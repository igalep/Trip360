import app from './server';
import { logger } from '../utils/logger';

const port = process.env.PORT || 3001;

async function startServer() {
  const frames = ['▖', '▘', '▝', '▗'];
  let i = 0;
  
  // Quick startup spinner animation (600ms)
  const interval = setInterval(() => {
    process.stdout.write(`\r\x1b[36m[BudgetControl Server] Starting up ${frames[i++ % frames.length]}...\x1b[0m`);
  }, 100);

  await new Promise((resolve) => setTimeout(resolve, 600));
  clearInterval(interval);
  
  app.listen(port, () => {
    // Clear line and print final status
    process.stdout.write('\r\x1b[K');
    logger.animation(`BudgetControl Server running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
});
