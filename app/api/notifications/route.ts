import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const store = await getStore();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ notifications: [] });
    }

    const token = authHeader.slice(7);
    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ notifications: [] });
    }

    const currentUser = store.users[payload.userId];
    if (!currentUser) {
      return NextResponse.json({ notifications: [] });
    }

    return NextResponse.json({ notifications: store.notifications.filter((n) => n.userId === currentUser.id) });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
