import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { errorHandler } from './middleware/errorHandler';
import { createAuthMiddleware } from './middleware/authMiddleware';
import { registerApiRoutes } from './routes';
import { createStore } from './store';

export async function createApp() {
  const app = express();
  const store = await createStore();

  app.use(express.json({ limit: '25mb' }));
  app.use(createAuthMiddleware(store));
  registerApiRoutes(app, store);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
