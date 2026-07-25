import { Router } from 'express';
import type { Badge, Report, VoteResult } from '../../types';
import { generateForensicHint } from '../services/gemini';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createPostsRouter(store: AppStore): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const { mediaType, difficulty, postType, sort } = req.query;
    const currentUser = (req as any).currentUser;

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
          userVote: currentUser ? (store.userVotes[currentUser.id]?.[post.id] || undefined) : undefined,
        }));

        if (sort === 'MOST_VOTED') {
          postsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);
        } else if (sort === 'HARDEST') {
          postsWithVotes.sort((a, b) => a.accuracyRate - b.accuracyRate);
        }

        return res.json({ posts: postsWithVotes });
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
      userVote: currentUser ? (store.userVotes[currentUser.id]?.[p.id] || undefined) : undefined,
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

    res.json({ posts: postsWithVotes });
  });

  router.get('/:id', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (isDatabaseConfigured()) {
      try {
        const post = await prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        return res.json({
          post: {
            ...post,
            userVote: currentUser ? (store.userVotes[currentUser.id]?.[post.id] || undefined) : undefined,
          },
        });
      } catch (error) {
        console.error('Failed to read a post from the database, falling back to memory store.', error);
      }
    }

    const post = store.posts.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      post: {
        ...post,
        userVote: currentUser ? (store.userVotes[currentUser.id]?.[post.id] || undefined) : undefined,
      },
    });
  });

  router.post('/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { voteLabel, voteSlot } = req.body;

    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: 'Please log in to vote.' });
    }

    const postIndex = store.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = store.posts[postIndex];

    if (store.userVotes[currentUser.id]?.[id]) {
      return res.status(400).json({ error: 'You have already voted on this challenge.' });
    }

    let isCorrect = false;
    let correctAnswer = '';

    if (post.postType === 'TYPE_A') {
      correctAnswer = post.trueLabel || 'REAL';
      isCorrect = voteLabel === post.trueLabel;
    } else {
      correctAnswer = post.fakeSlot || 'SLOT_A';
      isCorrect = voteSlot === post.fakeSlot;
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.vote.create({
          data: {
            id: `vote_${Date.now()}`,
            userId: currentUser.id,
            postId: id,
            voteLabel,
            voteSlot,
            isCorrect,
            pointsAwarded: 0,
          },
        });
      } catch (error) {
        console.error('Failed to save vote to the database, continuing with memory store.', error);
      }
    }

    let basePoints = 10;
    if (post.difficulty === 'INTERMEDIATE') basePoints = 20;
    if (post.difficulty === 'ADVANCED') basePoints = 35;
    if (post.difficulty === 'EXPERT') basePoints = 50;

    let bonusPoints = 0;
    if (post.totalVotes < 20) bonusPoints += 5;

    const pointsAwarded = isCorrect ? basePoints + bonusPoints : 0;

    post.totalVotes += 1;
    if (isCorrect) {
      post.correctVotes += 1;
    }
    post.accuracyRate = Math.round((post.correctVotes / post.totalVotes) * 1000) / 10;

    if (post.totalVotes >= 15) {
      if (post.accuracyRate > 80) post.difficulty = 'BEGINNER';
      else if (post.accuracyRate >= 50) post.difficulty = 'INTERMEDIATE';
      else if (post.accuracyRate >= 30) post.difficulty = 'ADVANCED';
      else post.difficulty = 'EXPERT';
    }

    const user = store.users[currentUser.id];
    if (user) {
      user.totalPoints += pointsAwarded;
      if (isCorrect) {
        user.streak += 1;
        if (user.streak > user.longestStreak) {
          user.longestStreak = user.streak;
        }
      }

      const totalUserVotes = Object.keys(store.userVotes[currentUser.id] || {}).length + 1;
      const totalCorrectUserVotes =
        Object.values(store.userVotes[currentUser.id] || {}).filter((v) => v.isCorrect).length + (isCorrect ? 1 : 0);
      user.accuracy = Math.round((totalCorrectUserVotes / totalUserVotes) * 1000) / 10;

      store.user = { ...user };
    }

    if (isDatabaseConfigured()) {
      try {
        await Promise.all([
          prisma.post.update({
            where: { id },
            data: {
              totalVotes: post.totalVotes,
              correctVotes: post.correctVotes,
              accuracyRate: post.accuracyRate,
            },
          }),
          prisma.user.update({
            where: { id: currentUser.id },
            data: {
              totalPoints: user ? user.totalPoints : currentUser.totalPoints,
              accuracy: user ? user.accuracy : currentUser.accuracy,
              streak: user ? user.streak : currentUser.streak,
              longestStreak: user ? user.longestStreak : currentUser.longestStreak,
            },
          }),
        ]);
      } catch (error) {
        console.error('Failed to update post stats and user progress in the database.', error);
      }
    }

    store.userVotes[currentUser.id] = {
      ...(store.userVotes[currentUser.id] || {}),
      [id]: {
        voteLabel,
        voteSlot,
        isCorrect,
        pointsAwarded,
        votedAt: new Date().toISOString(),
      },
    };

    let unlockedBadge: Badge | undefined;
    const totalUserVotes = Object.keys(store.userVotes[currentUser.id] || {}).length;
    const totalCorrectUserVotes =
      Object.values(store.userVotes[currentUser.id] || {}).filter((v) => v.isCorrect).length;

    if (totalUserVotes === 1) {
      const b = store.badges.find((bg) => bg.slug === 'first-vote');
      if (b && !b.unlockedAt) {
        b.unlockedAt = new Date().toISOString();
        unlockedBadge = b;
      }
    } else if (user && user.streak >= 7) {
      const b = store.badges.find((bg) => bg.slug === 'streak-7');
      if (b && !b.unlockedAt) {
        b.unlockedAt = new Date().toISOString();
        unlockedBadge = b;
      }
    }

    let aiHint = post.revealHint;
    if (!aiHint) {
      aiHint = await generateForensicHint(
        `Analyze this deepfake detection task: Post Type ${post.postType}, Caption: "${post.caption || 'None'}", Tags: ${post.tags.join(', ')}. Answer: ${correctAnswer}. Provide a 2-sentence forensic breakdown explaining key visual indicators to look for (e.g. earlobe contours, lighting direction, eye catchlights, blending artifacts).`,
        'Focus on catchlights in the pupils, unnatural skin smoothing, and lighting direction along jawlines.'
      );
      post.revealHint = aiHint;
    }

    const myRankIdx = store.leaderboard.findIndex((e) => e.id === currentUser.id);
    if (myRankIdx !== -1 && user) {
      store.leaderboard[myRankIdx].totalPoints = user.totalPoints;
      store.leaderboard[myRankIdx].accuracy = user.accuracy;
      store.leaderboard[myRankIdx].streak = user.streak;
      store.leaderboard[myRankIdx].totalVotesCount = totalUserVotes;
      store.leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
      store.leaderboard.forEach((item, index) => {
        item.rank = index + 1;
      });
    }

    const voteResult: VoteResult = {
      isCorrect,
      correctAnswer: correctAnswer as VoteResult['correctAnswer'],
      pointsAwarded,
      streak: user ? user.streak : currentUser.streak,
      accuracyRate: post.accuracyRate,
      revealHint:
        aiHint ||
        'Focus on catchlights in the pupils, unnatural skin smoothing, and lighting direction along jawlines.',
      forensicTells: post.forensicTells || [],
      badgeAwarded: unlockedBadge,
    };

    store.persist();
    res.json(voteResult);
  });

  router.post('/:id/ai-hint', async (req, res) => {
    const post = store.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const fallback =
      post.revealHint ||
      'Look for ear contour blending, unnatural pupil specular reflections, and mismatched lighting angles along clothing seams.';

    const hintText = await generateForensicHint(
      `You are DeepSpot AI Forensic Investigator. Examine this post: "${post.caption || 'Media Challenge'}", tags: [${post.tags.join(', ')}]. Truth label: ${post.trueLabel || post.fakeSlot}. Provide a crisp 2-sentence expert breakdown on specific visual tells (e.g. eye blink cadence, lighting physics, dermal pore pattern).`,
      fallback
    );

    post.revealHint = hintText;
    store.persist();
    res.json({ hint: hintText });
  });

  router.post('/:id/report', async (req, res) => {
    const { id } = req.params;
    const { reason, note } = req.body;

    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: 'Please log in to report a challenge.' });
    }

    const post = store.posts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      postId: id,
      postCaption: post.caption,
      reason: reason || 'OTHER',
      note,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConfigured()) {
      try {
        await prisma.report.create({
          data: {
            id: newReport.id,
            reporterId: newReport.reporterId,
            postId: newReport.postId,
            reason: newReport.reason,
            note: newReport.note,
            status: newReport.status,
            createdAt: new Date(newReport.createdAt),
          },
        });
      } catch (error) {
        console.error('Failed to save the report to the database.', error);
      }
    }

    store.reports.push(newReport);
    store.persist();
    res.json({
      message: 'Report submitted successfully. Thank you for keeping DeepSpot safe!',
      report: newReport,
    });
  });

  return router;
}
