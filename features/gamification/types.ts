// features/gamification/types.ts — TypeScript types for Energy, Streak, XP, Achievements, Leaderboards, Challenges

export interface UserEnergy {
  current: number;
  max: number;
  nextRefillIn: number;
}

export interface UserStreak {
  current: number;
  longest: number;
  todayCompleted: boolean;
}

export interface UserWallet {
  gems: number;
}

export interface XpDetails {
  level: number;
  current: number;
  next: number;
  total?: number;
}

export interface UserDashboard {
  energy: UserEnergy;
  streak: UserStreak;
  wallet: UserWallet;
  xp: XpDetails;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeUrl: string;
  unlockedAt?: string;
  createdAt?: string;
}

export type GamificationChallengeType = "DAILY" | "WEEKLY" | "SPECIAL" | string;
export type QuestType = "DAILY" | "WEEKLY" | "ACHIEVEMENT" | "SPECIAL" | string;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpAward: number;
  type: GamificationChallengeType;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  expiresAt: string;
}

export interface UserQuest {
  periodId: string;
  questId: string;
  slug: string;
  title: string;
  description: string;
  type: QuestType;
  metric: string;
  xpAward: number;
  targetCount: number;
  currentCount: number;
  auxCount: number;
  completed: boolean;
  rewardClaimed: boolean;
  expiresAt: string;
  claimedAt: string | null;
}

export interface QuestDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  metric: string;
  targetCount: number;
  xpAward: number;
}

export interface ClaimRewardResponse {
  xpAwarded: number;
  questTitle: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  school?: string;
  avatarUrl?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry | null;
}
