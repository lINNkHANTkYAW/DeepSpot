import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { Post } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await getStore();
    const { id } = await params;

    if (isDatabaseConfigured()) {
      try {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json({
          post: {
            ...post,
            userVote: undefined,
          },
        });
      } catch (error) {
        console.error('Failed to read a post from the database, falling back to memory store.', error);
      }
    }

    const post = store.posts.find((p) => p.id === id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        ...post,
        userVote: undefined,
      },
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
