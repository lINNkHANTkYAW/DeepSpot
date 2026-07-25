import type { Express } from 'express';
import type { AppStore } from '../store';
import { createAdminRouter } from './admin';
import { createAuthRouter } from './auth';
import { createHealthRouter } from './health';
import { createLeaderboardRouter } from './leaderboard';
import { createNotificationsRouter } from './notifications';
import { createPostsRouter } from './posts';
import { createProfileRouter } from './profile';
import { createUploadRouter } from './upload';
import { createDbTestRouter } from './db-test';
import { createSupabaseTestRouter } from './supabase-test';

export function registerApiRoutes(app: Express, store: AppStore): void {
  app.use('/api', createHealthRouter());
  app.use('/api/db', createDbTestRouter());
  app.use('/api/supabase', createSupabaseTestRouter());
  app.use('/api/auth', createAuthRouter(store));
  app.use('/api/posts', createPostsRouter(store));
  app.use('/api/upload', createUploadRouter(store));
  app.use('/api/leaderboard', createLeaderboardRouter(store));
  app.use('/api/profile', createProfileRouter(store));
  app.use('/api/admin', createAdminRouter(store));
  app.use('/api/notifications', createNotificationsRouter(store));
}
