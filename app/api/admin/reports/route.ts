import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  try {
    const store = await getStore();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Admin or moderator access required.' }, { status: 403 });
    }

    const token = authHeader.slice(7);
    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 403 });
    }

    const currentUser = store.users[payload.userId];
    if (!currentUser || !currentUser.isModerator) {
      return NextResponse.json({ error: 'Admin or moderator access required.' }, { status: 403 });
    }

    return NextResponse.json({ reports: store.reports });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
