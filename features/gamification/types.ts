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

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpAward: number;
  type: string; // "DAILY" | "WEEKLY" | "SPECIAL"
  targetCount: number;
  currentCount: number;
  completed: boolean;
  expiresAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry | null;
}
