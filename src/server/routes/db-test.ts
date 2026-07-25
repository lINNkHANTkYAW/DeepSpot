import { Router } from 'express';
import { prisma } from '../services/database';

export function createDbTestRouter(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, message: 'Supabase database connection is healthy.' });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Database connection failed.' });
    }
  });

  return router;
}
