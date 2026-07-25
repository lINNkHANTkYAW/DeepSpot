import { Router } from 'express';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createAdminRouter(store: AppStore): Router {
  const router = Router();

  router.get('/moderation/queue', async (_req, res) => {
    if (isDatabaseConfigured()) {
      try {
        const pending = await prisma.post.findMany({ where: { status: 'PENDING' } });
        return res.json({ pendingPosts: pending.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() })) });
      } catch (error) {
        console.error('Failed to read moderation queue from the database.', error);
      }
    }

    const pending = store.posts.filter((p) => p.status === 'PENDING');
    res.json({ pendingPosts: pending });
  });

  router.patch('/moderation/:id', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser || !currentUser.isModerator) {
      return res.status(403).json({ error: 'Admin or moderator access required.' });
    }

    const { id } = req.params;
    const { action } = req.body;

    if (isDatabaseConfigured()) {
      try {
        const updatedPost = await prisma.post.update({
          where: { id },
          data: { status: action === 'APPROVE' ? 'LIVE' : 'REJECTED' },
        });

        return res.json({ message: `Post ${id} has been ${action.toLowerCase()}d.`, post: { ...updatedPost, createdAt: updatedPost.createdAt.toISOString() } });
      } catch (error) {
        console.error('Failed to update moderation status in the database.', error);
      }
    }

    const post = store.posts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (action === 'APPROVE') {
      post.status = 'LIVE';
    } else {
      post.status = 'REJECTED';
    }

    store.persist();
    res.json({ message: `Post ${id} has been ${action.toLowerCase()}d.`, post });
  });

  router.get('/reports', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser || !currentUser.isModerator) {
      return res.status(403).json({ error: 'Admin or moderator access required.' });
    }

    if (isDatabaseConfigured()) {
      try {
        const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json({ reports: reports.map((report) => ({ ...report, createdAt: report.createdAt.toISOString() })) });
      } catch (error) {
        console.error('Failed to read reports from the database.', error);
      }
    }

    res.json({ reports: store.reports });
  });

  return router;
}
