export type PostType = 'TYPE_A' | 'TYPE_B'; // TYPE_A = 1 media (Real or Fake?), TYPE_B = 2 media (Which is fake?)
export type PostStatus = 'PENDING' | 'APPROVED' | 'LIVE' | 'CLOSED' | 'REJECTED';
export type MediaType = 'PHOTO' | 'VIDEO';
export type TruthLabel = 'REAL' | 'FAKE';
export type FakeSlot = 'SLOT_A' | 'SLOT_B';
export type Difficulty = 'UNRATED' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  city?: string;
  province?: string;
  country?: string;
  countryCode?: string;
  totalPoints: number;
  accuracy: number; // Percentage 0 - 100
  streak: number;
  longestStreak: number;
  role: UserRole;
  isModerator: boolean;
  createdAt: string;
}

export interface ForensicTell {
  id: string;
  xPercentage: number; // 0-100 position on media for marker
  yPercentage: number;
  label: string; // e.g. "Ear Lobe Distortion"
  description: string; // e.g. "Unnatural blending around left earlobe and hair intersection"
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  authorLocation?: string;
  postType: PostType;
  status: PostStatus;
  
  // For TYPE_A
  mediaUrl?: string;
  mediaType?: MediaType;
  trueLabel?: TruthLabel;

  // For TYPE_B
  mediaUrlA?: string;
  mediaUrlB?: string;
  mediaTypeA?: MediaType;
  mediaTypeB?: MediaType;
  fakeSlot?: FakeSlot;

  difficulty: Difficulty;
  revealHint?: string;
  caption?: string;
  tags: string[];
  sourceCredit?: string;

  forensicTells?: ForensicTell[];

  totalVotes: number;
  correctVotes: number;
  accuracyRate: number; // Calculated percentage
  
  createdAt: string;
  closedAt?: string;

  // Has current user voted?
  userVote?: {
    voteLabel?: TruthLabel;
    voteSlot?: FakeSlot;
    isCorrect: boolean;
    pointsAwarded: number;
    votedAt: string;
  };
}

export interface VoteRequest {
  voteLabel?: TruthLabel;
  voteSlot?: FakeSlot;
}

export interface VoteResult {
  isCorrect: boolean;
  correctAnswer: TruthLabel | FakeSlot;
  pointsAwarded: number;
  streak: number;
  accuracyRate: number;
  revealHint: string;
  forensicTells: ForensicTell[];
  badgeAwarded?: Badge;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  category: 'accuracy' | 'streak' | 'creator' | 'milestone';
  unlockedAt?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  postId: string;
  postCaption?: string;
  reason: 'WRONG_LABEL' | 'REAL_PERSON' | 'HARMFUL_CONTENT' | 'SPAM' | 'OTHER';
  note?: string;
  status: 'OPEN' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'POST_APPROVED' | 'MILESTONE_REACHED' | 'BADGE_EARNED' | 'RANK_CHANGE' | 'STREAK_REMINDER';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  country: string;
  countryCode: string;
  province?: string;
  city?: string;
  totalPoints: number;
  accuracy: number;
  streak: number;
  totalVotesCount: number;
}

export interface LeaderboardFilter {
  scope: 'global' | 'country' | 'province' | 'city';
  period: 'alltime' | 'month' | 'week';
}
