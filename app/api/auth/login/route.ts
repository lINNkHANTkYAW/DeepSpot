import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const store = await getStore();
    const { usernameOrEmail, password } = await request.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: 'Username/email and password are required.' }, { status: 400 });
    }

    const user = Object.values(store.users).find(
      (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const { token } = signToken(user.id);
    const responseUser = { ...user, passwordHash: undefined };

    return NextResponse.json({ user: responseUser, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
