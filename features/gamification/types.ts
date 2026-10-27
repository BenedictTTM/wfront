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

export interface ServerAchievementTier {
  id: string;
  tier: number;
  target: number;
  xpReward: number;
  gemReward: number;
  requirement: Record<string, any>;
  completed?: boolean;
  completedAt?: string | null;
}

export interface ServerAchievementCrest {
  name?: string | null;
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | null;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export interface ServerAchievementProgress {
  achievementId: string;
  title: string;
  description: string;
  category: "quizzes" | "streaks" | "mastery" | "multiplayer";
  icon: string;
  crestName?: string | null;
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | null;
  currentTier: number;
  progress: number;
  nextTarget: number;
  remaining: number;
  completed: boolean;
  unmetRequirementNote?: string | null;
  tiers: ServerAchievementTier[];
  crestUnlocked: boolean;
  crest?: ServerAchievementCrest;
}

export interface AchievementUnlockedPayload {
  achievementId: string;
  achievementTitle: string;
  tier: number;
  xpAwarded: number;
  gemsAwarded: number;
  crestUnlocked?: {
    crestName: string;
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | string;
  } | null;
}
