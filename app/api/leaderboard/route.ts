import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const store = await getStore();
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope');
    const authHeader = request.headers.get('authorization');
    
    let currentUser: { id: string; username: string; displayName: string; avatarUrl: string; country: string; countryCode: string; city: string; totalPoints: number; accuracy: number; streak: number } | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { verifyToken } = await import('@/lib/auth');
      const payload = verifyToken(token);
      if (payload) {
        currentUser = store.users[payload.userId] || null;
      }
    }

    if (isDatabaseConfigured()) {
      try {
        const users = await prisma.user.findMany({
          orderBy: [{ totalPoints: 'desc' }, { streak: 'desc' }],
          take: 50,
        });

        const leaderboard = users.map((user, index) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl || '',
          country: user.country || 'Myanmar',
          countryCode: user.countryCode || 'MM',
          province: user.province || undefined,
          city: user.city || undefined,
          totalPoints: user.totalPoints,
          accuracy: user.accuracy,
          streak: user.streak,
          totalVotesCount: 0,
        }));

        const myEntry = currentUser
          ? leaderboard.find((item) => item.id === currentUser!.id) || {
              rank: leaderboard.length + 1,
              id: currentUser.id,
              username: currentUser.username,
              displayName: currentUser.displayName,
              avatarUrl: currentUser.avatarUrl,
              country: currentUser.country || 'Myanmar',
              countryCode: currentUser.countryCode || 'MM',
              city: currentUser.city || 'Yangon',
              totalPoints: currentUser.totalPoints,
              accuracy: currentUser.accuracy,
              streak: currentUser.streak,
              totalVotesCount: Object.keys(store.userVotes[currentUser.id] || {}).length,
            }
          : null;

        return NextResponse.json({
          leaderboard,
          userRank: myEntry,
          stats: {
            totalUsers: leaderboard.length,
            solvedToday: 3840,
            fastestGrowingRegion: 'Southeast Asia (Myanmar & Vietnam)',
          },
        });
      } catch (error) {
        console.error('Failed to read leaderboard from the database.', error);
      }
    }

    let list = [...store.leaderboard];

    if (currentUser) {
      if (scope === 'country') {
        list = list.filter((item) => item.country === (currentUser.country || 'Myanmar'));
      } else if (scope === 'city') {
        list = list.filter((item) => item.city === (currentUser.city || 'Yangon'));
      }
    }

    list.sort((a, b) => b.totalPoints - a.totalPoints);
    list.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const myEntry = currentUser
      ? list.find((item) => item.id === currentUser!.id) || {
          rank: 4,
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          country: currentUser.country || 'Myanmar',
          countryCode: currentUser.countryCode || 'MM',
          city: currentUser.city || 'Yangon',
          totalPoints: currentUser.totalPoints,
          accuracy: currentUser.accuracy,
          streak: currentUser.streak,
          totalVotesCount: Object.keys(store.userVotes[currentUser.id] || {}).length,
        }
      : null;

    return NextResponse.json({
      leaderboard: list,
      userRank: myEntry,
      stats: {
        totalUsers: 14280,
        solvedToday: 3840,
        fastestGrowingRegion: 'Southeast Asia (Myanmar & Vietnam)',
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
