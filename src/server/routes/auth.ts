import { Router } from 'express';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';
import { hashPassword, verifyPassword, signToken as createJwt } from '../auth';
import type { SignupRequest, AuthResponse, User } from '../../types';

export function createAuthRouter(store: AppStore): Router {
  const router = Router();

  router.get('/me', async (req, res) => {
    res.json({ user: (req as any).currentUser });
  });

  router.post('/signup', async (req, res) => {
    const { username, email, displayName, password } = req.body as SignupRequest;

    if (!username || !email || !displayName || !password) {
      return res.status(400).json({ error: 'Username, email, display name, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = Object.values(store.users).find(
      (u) => u.username === username || u.email === email
    );
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const id = `user_${Date.now()}`;
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const newUser = {
      id,
      email,
      username,
      displayName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || username)}`,
      bio: '',
      city: '',
      province: '',
      country: '',
      countryCode: '',
      passwordHash,
      totalPoints: 0,
      accuracy: 0,
      streak: 0,
      longestStreak: 0,
      role: 'USER' as const,
      isModerator: false,
      createdAt: now,
    };

    store.users[id] = newUser;

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            displayName: newUser.displayName,
            avatarUrl: newUser.avatarUrl,
            bio: newUser.bio,
            city: newUser.city,
            province: newUser.province,
            country: newUser.country,
            countryCode: newUser.countryCode,
            passwordHash: newUser.passwordHash,
            totalPoints: newUser.totalPoints,
            accuracy: newUser.accuracy,
            streak: newUser.streak,
            longestStreak: newUser.longestStreak,
            role: newUser.role,
            isModerator: newUser.isModerator,
          },
        });
      } catch (error) {
        console.error('Failed to persist new user to the database.', error);
      }
    }

    const { token } = createJwt(id);
    store.sessions[token] = { userId: id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    store.user = { ...newUser };
    store.persist();

    const responseUser: Omit<User, 'passwordHash'> = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.displayName,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
      city: newUser.city,
      province: newUser.province,
      country: newUser.country,
      countryCode: newUser.countryCode,
      totalPoints: newUser.totalPoints,
      accuracy: newUser.accuracy,
      streak: newUser.streak,
      longestStreak: newUser.longestStreak,
      role: newUser.role,
      isModerator: newUser.isModerator,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({ user: responseUser, token } satisfies AuthResponse);
    store.sessions[token] = { userId: id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    store.user = { ...newUser };
    store.persist();
  });

  router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body as { usernameOrEmail?: string; password?: string };

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' });
    }

    const user = Object.values(store.users).find(
      (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const { token } = createJwt(user.id);
    store.sessions[token] = { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    store.user = { ...user };
    store.persist();

    const responseUser: Omit<User, 'passwordHash'> = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      province: user.province,
      country: user.country,
      countryCode: user.countryCode,
      totalPoints: user.totalPoints,
      accuracy: user.accuracy,
      streak: user.streak,
      longestStreak: user.longestStreak,
      role: user.role,
      isModerator: user.isModerator,
      createdAt: user.createdAt,
    };

    res.json({ user: responseUser, token } satisfies AuthResponse);
  });

  router.post('/logout', (_req, res) => {
    const authHeader = _req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      delete store.sessions[token];
    }
    store.user = null;
    store.persist();
    res.json({ success: true });
  });

  router.patch('/me', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const { displayName, bio, city, province, country, email, avatarUrl } = req.body;
    const current = store.users[currentUser.id];

    if (!current) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const updated = { ...current };

    if (displayName !== undefined) updated.displayName = displayName;
    if (bio !== undefined) updated.bio = bio;
    if (city !== undefined) updated.city = city;
    if (province !== undefined) updated.province = province;
    if (country !== undefined) updated.country = country;
    if (email !== undefined) updated.email = email;
    if (avatarUrl !== undefined) updated.avatarUrl = avatarUrl;

    store.users[updated.id] = updated;
    store.user = { ...updated };

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.update({
          where: { id: updated.id },
          data: {
            displayName: updated.displayName,
            bio: updated.bio,
            city: updated.city,
            province: updated.province,
            country: updated.country,
            email: updated.email,
            avatarUrl: updated.avatarUrl,
          },
        });
      } catch (error) {
        console.error('Failed to update user in the database.', error);
      }
    }

    const myRankIdx = store.leaderboard.findIndex((e) => e.id === updated.id);
    if (myRankIdx !== -1) {
      store.leaderboard[myRankIdx].displayName = updated.displayName;
      if (city) store.leaderboard[myRankIdx].city = city;
      if (country) store.leaderboard[myRankIdx].country = country;
    }

    store.persist();
    const responseUser: Omit<User, 'passwordHash'> = {
      id: store.user!.id,
      email: store.user!.email,
      username: store.user!.username,
      displayName: store.user!.displayName,
      avatarUrl: store.user!.avatarUrl,
      bio: store.user!.bio,
      city: store.user!.city,
      province: store.user!.province,
      country: store.user!.country,
      countryCode: store.user!.countryCode,
      totalPoints: store.user!.totalPoints,
      accuracy: store.user!.accuracy,
      streak: store.user!.streak,
      longestStreak: store.user!.longestStreak,
      role: store.user!.role,
      isModerator: store.user!.isModerator,
      createdAt: store.user!.createdAt,
    };
    res.json({ user: responseUser });
  });

  return router;
}
