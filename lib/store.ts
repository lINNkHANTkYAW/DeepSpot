import fs from 'node:fs';
import path from 'node:path';
import type { Post, User, Report, NotificationItem, LeaderboardEntry, Badge, UserVote } from '../types';
import { prisma, isDatabaseConfigured } from './prisma';

export interface AppStore {
  user: User | null;
  users: Record<string, User>;
  posts: Post[];
  leaderboard: LeaderboardEntry[];
  badges: Badge[];
  reports: Report[];
  userVotes: Record<string, Record<string, UserVote>>;
  notifications: NotificationItem[];
  persist: () => void;
}

const DEFAULT_USER: User = {
  id: 'usr_me_101',
  email: 'linnkhantk68@gmail.com',
  username: 'linn_kyaw',
  displayName: 'Linn Kyaw',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  bio: 'Media literacy advocate & digital investigator. Training human pattern recognition against synthetic media manipulation.',
  city: 'Yangon',
  province: 'Yangon Region',
  country: 'Myanmar',
  countryCode: 'MM',
  totalPoints: 1420,
  accuracy: 88.5,
  streak: 12,
  longestStreak: 18,
  role: 'ADMIN',
  isModerator: true,
  createdAt: '2026-01-15T08:30:00Z',
};

function getStoreFilePath(): string {
  return process.env.DEEP_SPOT_STORE_PATH || path.join(process.cwd(), '.data', 'deepspot-store.json');
}

function loadFromFile(): Partial<AppStore> {
  const storeFile = getStoreFilePath();
  if (!fs.existsSync(storeFile)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(storeFile, 'utf8');
    return JSON.parse(raw) as Partial<AppStore>;
  } catch {
    return {};
  }
}

function persistToFile(store: AppStore): void {
  const storeFile = getStoreFilePath();
  try {
    fs.mkdirSync(path.dirname(storeFile), { recursive: true });
    const { user, ...rest } = store;
    fs.writeFileSync(storeFile, JSON.stringify(rest, null, 2));
  } catch (error) {
    console.error('Failed to persist app store:', error);
  }
}

export async function createStore(): Promise<AppStore> {
  const store: AppStore = {
    user: null,
    users: {},
    posts: [],
    leaderboard: [],
    badges: [],
    reports: [],
    userVotes: {},
    notifications: [],
    persist: () => {},
  };

  const fileData = loadFromFile();
  store.users = fileData.users && typeof fileData.users === 'object' ? fileData.users : {};
  store.posts = Array.isArray(fileData.posts) ? fileData.posts : [];
  store.leaderboard = Array.isArray(fileData.leaderboard) ? fileData.leaderboard : [];
  store.badges = Array.isArray(fileData.badges) ? fileData.badges : [];
  store.reports = Array.isArray(fileData.reports) ? fileData.reports : [];
  store.userVotes = fileData.userVotes && typeof fileData.userVotes === 'object' ? fileData.userVotes : {};
  store.notifications = Array.isArray(fileData.notifications) ? fileData.notifications : [];

  if (isDatabaseConfigured()) {
    try {
      const [dbUsers, dbPosts, dbNotifications, dbReports] = await Promise.all([
        prisma.user.findMany(),
        prisma.post.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.report.findMany({ orderBy: { createdAt: 'desc' } }),
      ]);

      if (dbUsers.length > 0) {
        store.users = Object.fromEntries(
          dbUsers.map((u) => [u.id, { ...u, createdAt: u.createdAt.toISOString() } as User])
        );
      }

      if (dbPosts.length > 0) {
        store.posts = dbPosts.map((post) => ({
          ...post,
          createdAt: post.createdAt.toISOString(),
          closedAt: post.closedAt?.toISOString(),
          tags: post.tags || [],
          forensicTells: post.forensicTells as unknown as Post['forensicTells'],
        })) as Post[];
      }

      if (dbNotifications.length > 0) {
        store.notifications = dbNotifications.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })) as NotificationItem[];
      }

      if (dbReports.length > 0) {
        store.reports = dbReports.map((report) => ({
          ...report,
          createdAt: report.createdAt.toISOString(),
        })) as Report[];
      }
    } catch (error) {
      console.error('Failed to hydrate the app store from Prisma. Falling back to file data.', error);
    }
  }

  if (Object.keys(store.users).length === 0) {
    store.users[DEFAULT_USER.id] = { ...DEFAULT_USER };
  }

  const firstUserId = Object.keys(store.users)[0];
  if (firstUserId) {
    store.notifications = store.notifications.filter((n) => {
      const user = store.users[n.userId];
      return Boolean(user);
    });

    const notifications: NotificationItem[] = [
      {
        id: 'notif_1',
        userId: firstUserId,
        title: 'Welcome to DeepSpot!',
        message:
          'Train your brain to identify synthetic media manipulation. Your national rank is #1 in Myanmar!',
        type: 'MILESTONE_REACHED',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_2',
        userId: firstUserId,
        title: 'Streak Milestone!',
        message:
          'You have reached a 12-day voting streak! Keep going to earn the Month Detective badge.',
        type: 'BADGE_EARNED',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];

    const existingIds = new Set(store.notifications.map((n) => n.id));
    for (const n of notifications) {
      if (!existingIds.has(n.id) && store.users[n.userId]) {
        store.notifications.unshift(n);
      }
    }
  }

  store.persist = () => persistToFile(store);
  try {
    store.persist();
  } catch (error) {
    console.error('Initial store persistence failed:', error);
  }

  return store;
}

let storePromise: Promise<AppStore> | null = null;

export async function getStore(): Promise<AppStore> {
  if (!storePromise) {
    storePromise = createStore();
  }
  return storePromise;
}
