import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const tokenHeader = req.headers['x-session-token'];
    
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (typeof tokenHeader === 'string') {
      token = tokenHeader.trim();
    }

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const user = await AuthService.verifySessionToken(token);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session token. Please log in again.',
      });
      return;
    }

    // Set augmented request parameters cleanly without casting
    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
