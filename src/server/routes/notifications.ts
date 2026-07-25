import { Router } from 'express';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createNotificationsRouter(store: AppStore): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.json({ notifications: [] });
    }

    if (isDatabaseConfigured()) {
      try {
        const notifications = await prisma.notification.findMany({
          where: { userId: currentUser.id },
          orderBy: { createdAt: 'desc' },
        });

        return res.json({ notifications: notifications.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })) });
      } catch (error) {
        console.error('Failed to read notifications from the database.', error);
      }
    }

    res.json({ notifications: store.notifications.filter((n) => n.userId === currentUser.id) });
  });

  router.patch('/:id/read', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.notification.update({
          where: { id: req.params.id },
          data: { read: true },
        });
        return res.json({ success: true });
      } catch (error) {
        console.error('Failed to update notification read state in the database.', error);
      }
    }

    const notif = store.notifications.find((n) => n.id === req.params.id && n.userId === currentUser.id);
    if (notif) notif.read = true;
    store.persist();
    res.json({ success: true });
  });

  return router;
}
