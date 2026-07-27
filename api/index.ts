import 'dotenv/config';
import { createApp } from '../src/server/app';
import express from 'express';

let appPromise: Promise<ReturnType<typeof express>> | null = null;
let errorApp: ReturnType<typeof express> | null = null;

async function getApp() {
  if (errorApp) return errorApp;
  if (!appPromise) {
    appPromise = createApp()
      .then((app) => app)
      .catch((error) => {
        console.error('Failed to initialize DeepSpot app:', error);
        errorApp = express();
        errorApp.use((_req, res) => {
          res.status(500).json({ error: 'Server initialization failed. Check Vercel logs.' });
        });
        return errorApp;
      });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
