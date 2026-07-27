import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { User } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const store = await getStore();
    const { username } = await params;
    const isMe = username === 'me';
    const authHeader = request.headers.get('authorization');
    
    let currentUser: User | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { verifyToken } = await import('@/lib/auth');
      const payload = verifyToken(token);
      if (payload) {
        currentUser = store.users[payload.userId] || null;
      }
    }

    if (isMe) {
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
      }

      if (isDatabaseConfigured()) {
        try {
          const [user, posts, voteCount] = await Promise.all([
            prisma.user.findUnique({ where: { id: currentUser.id } }),
            prisma.post.findMany({ where: { authorId: currentUser.id } }),
            prisma.vote.count({ where: { userId: currentUser.id } }),
          ]);

          if (user) {
            return NextResponse.json({
              user: {
                ...user,
                createdAt: user.createdAt.toISOString(),
              },
              badges: store.badges,
              uploadedPosts: posts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() })),
              votesCount: voteCount,
            });
          }
        } catch (error) {
          console.error('Failed to read profile from the database.', error);
        }
      }

      const myPosts = store.posts.filter((p) => p.authorId === currentUser.id);
      const user = store.users[currentUser.id];
      return NextResponse.json({
        user: user || currentUser,
        badges: store.badges,
        uploadedPosts: myPosts,
        votesCount: Object.keys(store.userVotes[currentUser.id] || {}).length,
      });
    }

    if (isDatabaseConfigured()) {
      try {
        const profileUser = await prisma.user.findUnique({ where: { username } });
        if (profileUser) {
          const posts = await prisma.post.findMany({ where: { authorUsername: username } });
          return NextResponse.json({
            user: {
              id: profileUser.id,
              username: profileUser.username,
              displayName: profileUser.displayName,
              avatarUrl: profileUser.avatarUrl,
              country: profileUser.country,
              totalPoints: profileUser.totalPoints,
              accuracy: profileUser.accuracy,
              streak: profileUser.streak,
              role: profileUser.role,
            },
            badges: store.badges.slice(0, 4),
            uploadedPosts: posts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() })),
          });
        }
      } catch (error) {
        console.error('Failed to read another profile from the database.', error);
      }
    }

    const leaderboardUser = store.leaderboard.find((u) => u.username === username);
    if (!leaderboardUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: leaderboardUser.id,
        username: leaderboardUser.username,
        displayName: leaderboardUser.displayName,
        avatarUrl: leaderboardUser.avatarUrl,
        country: leaderboardUser.country,
        totalPoints: leaderboardUser.totalPoints,
        accuracy: leaderboardUser.accuracy,
        streak: leaderboardUser.streak,
        role: 'USER',
      },
      badges: store.badges.slice(0, 4),
      uploadedPosts: store.posts.filter((p) => p.authorUsername === username),
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
