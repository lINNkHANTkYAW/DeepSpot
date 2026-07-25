import fs from 'node:fs';
import path from 'node:path';
import type { AppStore } from './index';

export function getStoreFilePath(): string {
  return process.env.DEEP_SPOT_STORE_PATH || path.join(process.cwd(), '.data', 'deepspot-store.json');
}

export function loadAppStore(defaultStore: AppStore): AppStore {
  const storeFile = getStoreFilePath();

  if (!fs.existsSync(storeFile)) {
    return defaultStore;
  }

  try {
    const raw = fs.readFileSync(storeFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppStore>;

    if (!parsed || typeof parsed !== 'object') {
      return defaultStore;
    }

    return {
      ...defaultStore,
      ...parsed,
      user: parsed.user ?? defaultStore.user,
      users: parsed.users && typeof parsed.users === 'object' ? parsed.users : defaultStore.users,
      posts: Array.isArray(parsed.posts) ? parsed.posts : defaultStore.posts,
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : defaultStore.leaderboard,
      badges: Array.isArray(parsed.badges) ? parsed.badges : defaultStore.badges,
      reports: Array.isArray(parsed.reports) ? parsed.reports : defaultStore.reports,
      userVotes: parsed.userVotes && typeof parsed.userVotes === 'object' ? parsed.userVotes : defaultStore.userVotes,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaultStore.notifications,
      sessions: {},
    } satisfies AppStore as AppStore;
  } catch {
    return defaultStore;
  }
}

export function persistAppStore(store: AppStore): void {
  const { sessions, ...rest } = store;
  const storeFile = getStoreFilePath();
  fs.mkdirSync(path.dirname(storeFile), { recursive: true });
  fs.writeFileSync(storeFile, JSON.stringify(rest, null, 2));
}
