import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { generateForensicHint } from '@/lib/gemini';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { Post, VoteResult, Report } from '@/types';

export async function GET(request: Request) {
  try {
    const store = await getStore();
    const url = new URL(request.url);
    const mediaType = url.searchParams.get('mediaType') || 'ALL';
    const difficulty = url.searchParams.get('difficulty') || 'ALL';
    const postType = url.searchParams.get('postType') || 'ALL';
    const sort = url.searchParams.get('sort') || 'NEWEST';

    if (isDatabaseConfigured()) {
      try {
        const where: Record<string, unknown> = {
          OR: [{ status: 'LIVE' }, { status: 'CLOSED' }, { status: 'PENDING' }],
        };

        if (mediaType && mediaType !== 'ALL') {
          where.OR = [
            { mediaType: mediaType as string },
            { mediaTypeA: mediaType as string },
          ];
        }
        if (difficulty && difficulty !== 'ALL') {
          where.difficulty = difficulty as string;
        }
        if (postType && postType !== 'ALL') {
          where.postType = postType as string;
        }

        const posts = await prisma.post.findMany({
          where,
          orderBy: sort === 'NEWEST' ? { createdAt: 'desc' } : undefined,
        });

        const postsWithVotes = posts.map((post) => ({
          ...post,
          userVote: undefined,
        }));

        if (sort === 'MOST_VOTED') {
          postsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);
        } else if (sort === 'HARDEST') {
          postsWithVotes.sort((a, b) => a.accuracyRate - b.accuracyRate);
        }

        return NextResponse.json({ posts: postsWithVotes });
      } catch (error) {
        console.error('Failed to read posts from the database, falling back to memory store.', error);
      }
    }

    let filtered = store.posts.filter((p) => p.status === 'LIVE' || p.status === 'CLOSED' || p.status === 'PENDING');

    if (mediaType && mediaType !== 'ALL') {
      filtered = filtered.filter(
        (p) => p.mediaType === mediaType || p.mediaTypeA === mediaType
      );
    }
    if (difficulty && difficulty !== 'ALL') {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }
    if (postType && postType !== 'ALL') {
      filtered = filtered.filter((p) => p.postType === postType);
    }

    const postsWithVotes = filtered.map((p) => ({
      ...p,
      userVote: undefined,
    }));

    if (sort === 'NEWEST') {
      postsWithVotes.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === 'MOST_VOTED') {
      postsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sort === 'HARDEST') {
      postsWithVotes.sort((a, b) => a.accuracyRate - b.accuracyRate);
    }

    return NextResponse.json({ posts: postsWithVotes });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
