import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  CURRENT_DEMO_USER,
  INITIAL_POSTS,
  INITIAL_LEADERBOARD,
  INITIAL_BADGES,
} from './src/data/seedData';
import {
  Post,
  User,
  VoteResult,
  Report,
  NotificationItem,
  LeaderboardEntry,
  Badge,
} from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // In-memory data store for server session
  let userStore: User = { ...CURRENT_DEMO_USER };
  let postsStore: Post[] = JSON.parse(JSON.stringify(INITIAL_POSTS));
  let leaderboardStore: LeaderboardEntry[] = JSON.parse(JSON.stringify(INITIAL_LEADERBOARD));
  let badgesStore: Badge[] = JSON.parse(JSON.stringify(INITIAL_BADGES));
  let reportsStore: Report[] = [];
  let userVotesMap: Record<string, { voteLabel?: string; voteSlot?: string; isCorrect: boolean; pointsAwarded: number; votedAt: string }> = {};
  let notificationsStore: NotificationItem[] = [
    {
      id: 'notif_1',
      userId: userStore.id,
      title: 'Welcome to DeepSpot!',
      message: 'Train your brain to identify synthetic media manipulation. Your national rank is #1 in Myanmar!',
      type: 'MILESTONE_REACHED',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_2',
      userId: userStore.id,
      title: 'Streak Milestone!',
      message: 'You have reached a 12-day voting streak! 🔥 Keep going to earn the Month Detective badge.',
      type: 'BADGE_EARNED',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  // Helper for Gemini AI client
  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // ---------------- API ROUTES ----------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', appName: 'DeepSpot', version: '1.0.0' });
  });

  // Auth / Current User
  app.get('/api/auth/me', (req, res) => {
    res.json({ user: userStore });
  });

  app.patch('/api/auth/me', (req, res) => {
    const { displayName, bio, city, province, country } = req.body;
    if (displayName) userStore.displayName = displayName;
    if (bio !== undefined) userStore.bio = bio;
    if (city) userStore.city = city;
    if (province) userStore.province = province;
    if (country) userStore.country = country;

    // Update leaderboard entry if exists
    const myRankIdx = leaderboardStore.findIndex((e) => e.id === userStore.id);
    if (myRankIdx !== -1) {
      leaderboardStore[myRankIdx].displayName = userStore.displayName;
      if (city) leaderboardStore[myRankIdx].city = city;
      if (country) leaderboardStore[myRankIdx].country = country;
    }

    res.json({ user: userStore });
  });

  // Posts Feed
  app.get('/api/posts', (req, res) => {
    const { mediaType, difficulty, postType, sort } = req.query;

    let filtered = postsStore.filter((p) => p.status === 'LIVE' || p.status === 'CLOSED');

    if (mediaType && mediaType !== 'ALL') {
      filtered = filtered.filter((p) => p.mediaType === mediaType || p.mediaTypeA === mediaType);
    }
    if (difficulty && difficulty !== 'ALL') {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }
    if (postType && postType !== 'ALL') {
      filtered = filtered.filter((p) => p.postType === postType);
    }

    // Attach user vote if present
    const postsWithVotes = filtered.map((p) => {
      const vote = userVotesMap[p.id];
      return {
        ...p,
        userVote: vote || undefined,
      };
    });

    // Sorting
    if (sort === 'NEWEST') {
      postsWithVotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'MOST_VOTED') {
      postsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sort === 'HARDEST') {
      postsWithVotes.sort((a, b) => a.accuracyRate - b.accuracyRate);
    }

    res.json({ posts: postsWithVotes });
  });

  // Single Post
  app.get('/api/posts/:id', (req, res) => {
    const post = postsStore.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const vote = userVotesMap[post.id];
    res.json({
      post: {
        ...post,
        userVote: vote || undefined,
      },
    });
  });

  // Vote Endpoint
  app.post('/api/posts/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { voteLabel, voteSlot } = req.body;

    const postIndex = postsStore.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postsStore[postIndex];

    if (userVotesMap[id]) {
      return res.status(400).json({ error: 'You have already voted on this challenge.' });
    }

    let isCorrect = false;
    let correctAnswer: string = '';

    if (post.postType === 'TYPE_A') {
      correctAnswer = post.trueLabel || 'REAL';
      isCorrect = voteLabel === post.trueLabel;
    } else {
      correctAnswer = post.fakeSlot || 'SLOT_A';
      isCorrect = voteSlot === post.fakeSlot;
    }

    // Base point calculations by difficulty
    let basePoints = 10;
    if (post.difficulty === 'INTERMEDIATE') basePoints = 20;
    if (post.difficulty === 'ADVANCED') basePoints = 35;
    if (post.difficulty === 'EXPERT') basePoints = 50;

    // Early detective bonus (+5 if under 20 votes)
    let bonusPoints = 0;
    if (post.totalVotes < 20) bonusPoints += 5;

    const pointsAwarded = isCorrect ? basePoints + bonusPoints : 0;

    // Update Post stats
    post.totalVotes += 1;
    if (isCorrect) {
      post.correctVotes += 1;
    }
    post.accuracyRate = Math.round((post.correctVotes / post.totalVotes) * 1000) / 10;

    // Auto calibrate post difficulty after 15+ votes
    if (post.totalVotes >= 15) {
      if (post.accuracyRate > 80) post.difficulty = 'BEGINNER';
      else if (post.accuracyRate >= 50) post.difficulty = 'INTERMEDIATE';
      else if (post.accuracyRate >= 30) post.difficulty = 'ADVANCED';
      else post.difficulty = 'EXPERT';
    }

    // Update User Stats
    userStore.totalPoints += pointsAwarded;
    if (isCorrect) {
      userStore.streak += 1;
      if (userStore.streak > userStore.longestStreak) {
        userStore.longestStreak = userStore.streak;
      }
    } else {
      // Streak stays intact for learning, or decrements gently (we keep streak encouragement)
    }

    // Recalculate user total votes & accuracy
    const totalUserVotes = Object.keys(userVotesMap).length + 1;
    const totalCorrectUserVotes =
      Object.values(userVotesMap).filter((v) => v.isCorrect).length + (isCorrect ? 1 : 0);
    userStore.accuracy = Math.round((totalCorrectUserVotes / totalUserVotes) * 1000) / 10;

    // Record User Vote
    const voteData = {
      voteLabel,
      voteSlot,
      isCorrect,
      pointsAwarded,
      votedAt: new Date().toISOString(),
    };
    userVotesMap[id] = voteData;

    // Check Badge Unlock Condition
    let unlockedBadge: Badge | undefined = undefined;
    if (totalUserVotes === 1) {
      const b = badgesStore.find((bg) => bg.slug === 'first-vote');
      if (b && !b.unlockedAt) {
        b.unlockedAt = new Date().toISOString();
        unlockedBadge = b;
      }
    } else if (userStore.streak >= 7) {
      const b = badgesStore.find((bg) => bg.slug === 'streak-7');
      if (b && !b.unlockedAt) {
        b.unlockedAt = new Date().toISOString();
        unlockedBadge = b;
      }
    }

    // Generate AI Reveal hint if needed
    let aiHint = post.revealHint;
    if (!aiHint) {
      try {
        const ai = getGeminiClient();
        if (ai) {
          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `Analyze this deepfake detection task: Post Type ${post.postType}, Caption: "${post.caption || 'None'}", Tags: ${post.tags.join(', ')}. Answer: ${correctAnswer}. Provide a 2-sentence forensic breakdown explaining key visual indicators to look for (e.g. earlobe contours, lighting direction, eye catchlights, blending artifacts).`,
          });
          if (response.text) {
            aiHint = response.text.trim();
            post.revealHint = aiHint;
          }
        }
      } catch (err) {
        console.error('AI Hint generation error:', err);
      }
    }

    // Update Leaderboard entry for current user
    const myRankIdx = leaderboardStore.findIndex((e) => e.id === userStore.id);
    if (myRankIdx !== -1) {
      leaderboardStore[myRankIdx].totalPoints = userStore.totalPoints;
      leaderboardStore[myRankIdx].accuracy = userStore.accuracy;
      leaderboardStore[myRankIdx].streak = userStore.streak;
      leaderboardStore[myRankIdx].totalVotesCount = totalUserVotes;
      // re-sort leaderboard
      leaderboardStore.sort((a, b) => b.totalPoints - a.totalPoints);
      leaderboardStore.forEach((item, index) => {
        item.rank = index + 1;
      });
    }

    const voteResult: VoteResult = {
      isCorrect,
      correctAnswer: correctAnswer as any,
      pointsAwarded,
      streak: userStore.streak,
      accuracyRate: post.accuracyRate,
      revealHint: aiHint || 'Focus on catchlights in the pupils, unnatural skin smoothing, and lighting direction along jawlines.',
      forensicTells: post.forensicTells || [],
      badgeAwarded: unlockedBadge,
    };

    res.json(voteResult);
  });

  // AI Hint Generation On Demand
  app.post('/api/posts/:id/ai-hint', async (req, res) => {
    const { id } = req.params;
    const post = postsStore.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          hint: post.revealHint || 'Look for ear contour blending, unnatural pupil specular reflections, and mismatched lighting angles along clothing seams.',
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are DeepSpot AI Forensic Investigator. Examine this post: "${post.caption || 'Media Challenge'}", tags: [${post.tags.join(', ')}]. Truth label: ${post.trueLabel || post.fakeSlot}. Provide a crisp 2-sentence expert breakdown on specific visual tells (e.g. eye blink cadence, lighting physics, dermal pore pattern).`,
      });

      const hintText = response.text?.trim() || post.revealHint;
      post.revealHint = hintText;
      res.json({ hint: hintText });
    } catch (err) {
      console.error(err);
      res.json({
        hint: post.revealHint || 'Inspect pupil reflections and hairline edge blending closely.',
      });
    }
  });

  // Upload Challenge Route
  app.post('/api/upload', async (req, res) => {
    const {
      postType,
      mediaUrl,
      mediaType,
      trueLabel,
      mediaUrlA,
      mediaUrlB,
      mediaTypeA,
      mediaTypeB,
      fakeSlot,
      caption,
      tags,
      sourceCredit,
    } = req.body;

    if (!postType) {
      return res.status(400).json({ error: 'Post type is required' });
    }

    const newPostId = `post_${Date.now()}`;

    let generatedHint = 'AI pre-screen complete. Pay attention to eye reflection consistency and neck boundary edges.';
    let detectedTells = [
      {
        id: `tell_new_1`,
        xPercentage: 45,
        yPercentage: 40,
        label: 'Boundary Blurring',
        description: 'AI detection noticed subtle pixel transition smoothing near key facial outline.',
      },
    ];

    // Call Gemini API to pre-screen and analyze upload if key exists
    try {
      const ai = getGeminiClient();
      if (ai) {
        const promptText = `Analyze user media challenge submission for deepfake detection training. Post Type: ${postType}, Caption: "${caption || ''}", Tags: ${tags?.join(', ') || ''}. Label: ${trueLabel || fakeSlot}. Generate a short 2-sentence forensic hint for learners showing what subtle visual tells to inspect after voting.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
        });
        if (response.text) {
          generatedHint = response.text.trim();
        }
      }
    } catch (e) {
      console.log('Gemini pre-screen fallback applied:', e);
    }

    const newPost: Post = {
      id: newPostId,
      authorId: userStore.id,
      authorUsername: userStore.username,
      authorDisplayName: userStore.displayName,
      authorAvatar: userStore.avatarUrl,
      authorLocation: `${userStore.city || 'Yangon'}, ${userStore.country || 'Myanmar'}`,
      postType,
      status: 'PENDING', // Submits into moderation queue
      mediaUrl,
      mediaType: mediaType || 'PHOTO',
      trueLabel,
      mediaUrlA,
      mediaUrlB,
      mediaTypeA: mediaTypeA || 'PHOTO',
      mediaTypeB: mediaTypeB || 'PHOTO',
      fakeSlot,
      difficulty: 'INTERMEDIATE',
      revealHint: generatedHint,
      caption: caption || 'Community challenge submission',
      tags: tags || ['community-upload'],
      sourceCredit: sourceCredit || 'User Upload',
      forensicTells: detectedTells,
      totalVotes: 0,
      correctVotes: 0,
      accuracyRate: 0,
      createdAt: new Date().toISOString(),
    };

    postsStore.unshift(newPost);

    // Award upload points
    userStore.totalPoints += 15;

    // Check creator badge
    const creatorBadge = badgesStore.find((b) => b.slug === 'challenger');
    if (creatorBadge && !creatorBadge.unlockedAt) {
      creatorBadge.unlockedAt = new Date().toISOString();
    }

    // Add Notification
    notificationsStore.unshift({
      id: `notif_${Date.now()}`,
      userId: userStore.id,
      title: 'Challenge Submitted!',
      message: 'Your deepfake challenge is under review by moderators. You earned +15 creator points!',
      type: 'POST_APPROVED',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: 'Challenge uploaded successfully and submitted for moderation!',
      post: newPost,
    });
  });

  // Leaderboard API
  app.get('/api/leaderboard', (req, res) => {
    const { scope, period } = req.query;

    let list = [...leaderboardStore];

    if (scope === 'country') {
      list = list.filter((item) => item.country === (userStore.country || 'Myanmar'));
    } else if (scope === 'city') {
      list = list.filter((item) => item.city === (userStore.city || 'Yangon'));
    }

    // Sort by points
    list.sort((a, b) => b.totalPoints - a.totalPoints);
    list.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const myEntry = list.find((item) => item.id === userStore.id) || {
      rank: 4,
      id: userStore.id,
      username: userStore.username,
      displayName: userStore.displayName,
      avatarUrl: userStore.avatarUrl,
      country: userStore.country || 'Myanmar',
      countryCode: userStore.countryCode || 'MM',
      city: userStore.city || 'Yangon',
      totalPoints: userStore.totalPoints,
      accuracy: userStore.accuracy,
      streak: userStore.streak,
      totalVotesCount: Object.keys(userVotesMap).length,
    };

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

  // Profile API
  app.get('/api/profile/:username', (req, res) => {
    const { username } = req.params;
    const isMe = username === userStore.username || username === 'me';

    if (isMe) {
      const myPosts = postsStore.filter((p) => p.authorId === userStore.id);
      return res.json({
        user: userStore,
        badges: badgesStore,
        uploadedPosts: myPosts,
        votesCount: Object.keys(userVotesMap).length,
      });
    }

    const leaderboardUser = leaderboardStore.find((u) => u.username === username);
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
      badges: badgesStore.slice(0, 4),
      uploadedPosts: postsStore.filter((p) => p.authorUsername === username),
    });
  });

  // Moderation API
  app.get('/api/admin/moderation/queue', (req, res) => {
    const pending = postsStore.filter((p) => p.status === 'PENDING');
    res.json({ pendingPosts: pending });
  });

  app.patch('/api/admin/moderation/:id', (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT

    const post = postsStore.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (action === 'APPROVE') {
      post.status = 'LIVE';
    } else {
      post.status = 'REJECTED';
    }

    res.json({ message: `Post ${id} has been ${action.toLowerCase()}d.`, post });
  });

  // Reports API
  app.post('/api/posts/:id/report', (req, res) => {
    const { id } = req.params;
    const { reason, note } = req.body;

    const post = postsStore.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: userStore.id,
      reporterUsername: userStore.username,
      postId: id,
      postCaption: post.caption,
      reason: reason || 'OTHER',
      note,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    reportsStore.push(newReport);
    res.json({ message: 'Report submitted successfully. Thank you for keeping DeepSpot safe!', report: newReport });
  });

  app.get('/api/admin/reports', (req, res) => {
    res.json({ reports: reportsStore });
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json({ notifications: notificationsStore });
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    const notif = notificationsStore.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  // ---------------- VITE MIDDLEWARE ----------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeepSpot server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
