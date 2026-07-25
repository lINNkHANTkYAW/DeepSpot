import { Router } from 'express';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createLeaderboardRouter(store: AppStore): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const { scope } = req.query;
    const currentUser = (req as any).currentUser;

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
          ? leaderboard.find((item) => item.id === currentUser.id) || {
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

        return res.json({
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
      ? list.find((item) => item.id === currentUser.id) || {
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

    res.json({
      leaderboard: list,
      userRank: myEntry,
      stats: {
        totalUsers: 14280,
        solvedToday: 3840,
        fastestGrowingRegion: 'Southeast Asia (Myanmar & Vietnam)',
      },
    });
  });

  return router;
}
