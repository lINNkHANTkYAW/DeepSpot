import {
  CURRENT_DEMO_USER,
  INITIAL_POSTS,
  INITIAL_LEADERBOARD,
  INITIAL_BADGES,
} from '../../data/seedData';
import type {
  Post,
  User,
  Report,
  NotificationItem,
  LeaderboardEntry,
  Badge,
} from '../../types';
import { isDatabaseConfigured, prisma } from '../services/database';
import { loadAppStore, persistAppStore } from './persistence';

export interface UserVote {
  voteLabel?: string;
  voteSlot?: string;
  isCorrect: boolean;
  pointsAwarded: number;
  votedAt: string;
}

export interface AppStore {
  user: User | null;
  users: Record<string, User>;
  posts: Post[];
  leaderboard: LeaderboardEntry[];
  badges: Badge[];
  reports: Report[];
  userVotes: Record<string, Record<string, UserVote>>;
  notifications: NotificationItem[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
  persist: () => void;
}

export async function createStore(): Promise<AppStore> {
  const defaultStore: AppStore = {
    user: null,
    users: {},
    posts: JSON.parse(JSON.stringify(INITIAL_POSTS)) as Post[],
    leaderboard: JSON.parse(JSON.stringify(INITIAL_LEADERBOARD)) as LeaderboardEntry[],
    badges: JSON.parse(JSON.stringify(INITIAL_BADGES)) as Badge[],
    reports: [],
    userVotes: {},
    notifications: [],
    sessions: {},
    persist: () => {},
  };

  const store = loadAppStore(defaultStore);

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
      console.error('Failed to hydrate the app store from Prisma. Falling back to seed data.', error);
    }
  }

  if (Object.keys(store.users).length === 0) {
    const demoUser: User = { ...CURRENT_DEMO_USER };
    store.users[demoUser.id] = demoUser;
    store.leaderboard = JSON.parse(JSON.stringify(INITIAL_LEADERBOARD)) as LeaderboardEntry[];
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

  store.persist = () => persistAppStore(store);
  store.persist();

  return store;
}
