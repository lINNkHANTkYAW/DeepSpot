import { Router } from 'express';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', appName: 'DeepSpot', version: '1.0.0' });
  });

  return router;
}
