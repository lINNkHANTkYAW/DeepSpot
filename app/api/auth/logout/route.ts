import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const store = await getStore();
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // In a real implementation, we'd verify the token and delete the session
      // For now, just clear the current user
    }
    store.user = null;
    store.persist();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
