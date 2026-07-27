import { NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { getStore } from './store';
import type { User } from '@/types';

export async function getAuthUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const store = await getStore();
  const user = store.users[payload.userId];
  return user ? { ...user, passwordHash: undefined } : null;
}

export function jsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
