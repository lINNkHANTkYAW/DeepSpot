import { Router } from 'express';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createProfileRouter(store: AppStore): Router {
  const router = Router();

  router.get('/:username', async (req, res) => {
    const { username } = req.params;
    const isMe = username === 'me';
    const currentUser = (req as any).currentUser;

    if (isMe) {
      if (!currentUser) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }

      if (isDatabaseConfigured()) {
        try {
          const [user, posts, voteCount] = await Promise.all([
            prisma.user.findUnique({ where: { id: currentUser.id } }),
            prisma.post.findMany({ where: { authorId: currentUser.id } }),
            prisma.vote.count({ where: { userId: currentUser.id } }),
          ]);

          if (user) {
            return res.json({
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
      return res.json({
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
          return res.json({
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
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
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
  });

  return router;
}
