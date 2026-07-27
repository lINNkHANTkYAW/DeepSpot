import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';
import type { SignupRequest, AuthResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const store = await getStore();
    const { username, email, displayName, password } = (await request.json()) as SignupRequest;

    if (!username || !email || !displayName || !password) {
      return NextResponse.json({ error: 'Username, email, display name, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = Object.values(store.users).find(
      (u) => u.username === username || u.email === email
    );
    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists.' }, { status: 409 });
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
    store.persist();

    const { token } = signToken(id);
    const responseUser: Omit<AuthResponse['user'], 'passwordHash'> = {
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

    return NextResponse.json({ user: responseUser, token } satisfies AuthResponse, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
