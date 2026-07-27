import 'dotenv/config';
import { createApp } from '../src/server/app';

let appPromise: Promise<ReturnType<import('express').Express>> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
