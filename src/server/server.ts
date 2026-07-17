import express from 'express';
import cors from 'cors';
import tripsRouter from './routes/trips.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripsRouter);

// Default health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;
