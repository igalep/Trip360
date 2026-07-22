import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}
