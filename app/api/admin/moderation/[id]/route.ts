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

    const { action } = await request.json();
    const post = store.posts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    if (action === 'APPROVE') {
      post.status = 'LIVE';
    } else {
      post.status = 'REJECTED';
    }

    store.persist();
    return NextResponse.json({ message: `Post ${id} has been ${action.toLowerCase()}d.`, post });
  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
