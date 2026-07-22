import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema, LoginUserSchema } from '../schemas/auth.schema';
import { validateRequest } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRequest({ body: RegisterUserSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login existing user
router.post('/login', validateRequest({ body: LoginUserSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout - Logout current user
router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const tokenHeader = req.headers['x-session-token'];
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (typeof tokenHeader === 'string') {
      token = tokenHeader.trim();
    }

    if (token) {
      await AuthService.logout(token);
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
