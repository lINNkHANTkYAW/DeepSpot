import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await getStore();
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const currentUser = store.users[payload.userId];
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const notif = store.notifications.find((n) => n.id === id && n.userId === currentUser.id);
    if (notif) notif.read = true;
    store.persist();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
