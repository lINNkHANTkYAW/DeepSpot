import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { generateForensicHint } from '@/lib/gemini';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { Badge, VoteResult } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await getStore();
    const { id } = await params;
    const { voteLabel, voteSlot } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Please log in to vote.' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const currentUser = store.users[payload.userId];
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }

    const postIndex = store.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = store.posts[postIndex];

    if (store.userVotes[currentUser.id]?.[id]) {
      return NextResponse.json({ error: 'You have already voted on this challenge.' }, { status: 400 });
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
    return NextResponse.json(voteResult);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
