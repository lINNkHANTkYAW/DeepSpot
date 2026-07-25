import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth';
import type { AppStore } from '../store';

export function createAuthMiddleware(store: AppStore) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      (req as any).currentUser = null;
      return next();
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      (req as any).currentUser = null;
      return next();
    }

    const user = store.users[payload.userId];
    (req as any).currentUser = user ? { ...user, passwordHash: undefined } : null;
    next();
  };
}
