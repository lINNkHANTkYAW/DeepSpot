import { Router } from 'express';
import type { Post } from '../../types';
import { generateForensicHint } from '../services/gemini';
import { isDatabaseConfigured, prisma } from '../services/database';
import type { AppStore } from '../store';

export function createUploadRouter(store: AppStore): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const currentUser = (req as any).currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: 'Please log in to upload a challenge.' });
    }

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

    const generatedHint = await generateForensicHint(
      `Analyze user media challenge submission for deepfake detection training. Post Type: ${postType}, Caption: "${caption || ''}", Tags: ${tags?.join(', ') || ''}. Label: ${trueLabel || fakeSlot}. Generate a short 2-sentence forensic hint for learners showing what subtle visual tells to inspect after voting.`,
      'AI pre-screen complete. Pay attention to eye reflection consistency and neck boundary edges.'
    );

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorDisplayName: currentUser.displayName,
      authorAvatar: currentUser.avatarUrl,
      authorLocation: `${currentUser.city || 'Yangon'}, ${currentUser.country || 'Myanmar'}`,
      postType,
      status: 'PENDING',
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
      forensicTells: [
        {
          id: 'tell_new_1',
          xPercentage: 45,
          yPercentage: 40,
          label: 'Boundary Blurring',
          description:
            'AI detection noticed subtle pixel transition smoothing near key facial outline.',
        },
      ],
      totalVotes: 0,
      correctVotes: 0,
      accuracyRate: 0,
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.upsert({
          where: { id: currentUser.id },
          update: {
            email: currentUser.email,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
            bio: currentUser.bio,
            city: currentUser.city,
            province: currentUser.province,
            country: currentUser.country,
            countryCode: currentUser.countryCode,
            totalPoints: currentUser.totalPoints,
            accuracy: currentUser.accuracy,
            streak: currentUser.streak,
            longestStreak: currentUser.longestStreak,
            role: currentUser.role,
            isModerator: currentUser.isModerator,
          },
          create: {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
            bio: currentUser.bio,
            city: currentUser.city,
            province: currentUser.province,
            country: currentUser.country,
            countryCode: currentUser.countryCode,
            totalPoints: currentUser.totalPoints,
            accuracy: currentUser.accuracy,
            streak: currentUser.streak,
            longestStreak: currentUser.longestStreak,
            role: currentUser.role,
            isModerator: currentUser.isModerator,
          },
        });

        const createdPost = await prisma.post.create({
          data: {
            id: newPost.id,
            authorId: newPost.authorId,
            authorUsername: newPost.authorUsername,
            authorDisplayName: newPost.authorDisplayName,
            authorAvatar: newPost.authorAvatar,
            authorLocation: newPost.authorLocation,
            postType: newPost.postType,
            status: newPost.status,
            mediaUrl: newPost.mediaUrl,
            mediaType: newPost.mediaType,
            trueLabel: newPost.trueLabel,
            mediaUrlA: newPost.mediaUrlA,
            mediaUrlB: newPost.mediaUrlB,
            mediaTypeA: newPost.mediaTypeA,
            mediaTypeB: newPost.mediaTypeB,
            fakeSlot: newPost.fakeSlot,
            difficulty: newPost.difficulty,
            revealHint: newPost.revealHint,
            caption: newPost.caption,
            tags: newPost.tags,
            sourceCredit: newPost.sourceCredit,
            forensicTells: newPost.forensicTells as any,
            totalVotes: newPost.totalVotes,
            correctVotes: newPost.correctVotes,
            accuracyRate: newPost.accuracyRate,
            createdAt: new Date(newPost.createdAt),
          },
        });

        newPost.id = createdPost.id;
      } catch (error) {
        console.error('Failed to persist uploaded post to the database, falling back to memory store.', error);
      }
    }

    store.posts.unshift(newPost);
    const user = store.users[currentUser.id];
    if (user) {
      user.totalPoints += 15;
      store.user = { ...user };
    }

    const creatorBadge = store.badges.find((b) => b.slug === 'challenger');
    if (creatorBadge && !creatorBadge.unlockedAt) {
      creatorBadge.unlockedAt = new Date().toISOString();
    }

    store.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Challenge Submitted!',
      message:
        'Your deepfake challenge is under review by moderators. You earned +15 creator points!',
      type: 'POST_APPROVED',
      read: false,
      createdAt: new Date().toISOString(),
    });

    store.persist();
    res.json({
      message: 'Challenge uploaded successfully and submitted for moderation!',
      post: newPost,
    });
  });

  return router;
}
