import 'dotenv/config';
import { createApp } from '../src/server/app';

let appPromise: Promise<ReturnType<import('express').Express>> | null = null;
let errorApp: ReturnType<import('express').Express> | null = null;

async function getApp() {
  if (errorApp) return errorApp;
  if (!appPromise) {
    appPromise = createApp()
      .then((app) => app)
      .catch((error) => {
        console.error('Failed to initialize DeepSpot app:', error);
        const express = require('express');
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
