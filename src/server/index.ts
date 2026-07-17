import app from './server';

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
    const timestamp = new Date().toLocaleString();
    // Clear line and print final status
    process.stdout.write('\r\x1b[K');
    console.log(`\x1b[32m✔ [BudgetControl Server] Running successfully!\x1b[0m`);
    console.log(`\x1b[34mℹ Address:\x1b[0m http://localhost:${port}`);
    console.log(`\x1b[34mℹ Started at:\x1b[0m ${timestamp}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
