// features/gamification — XP, achievements, leaderboards, challenges
// TODO: implement
export type Achievement = { id: string; name: string; unlockedAt: string | null; /* TODO */ };
export type LeaderboardEntry = { userId: string; rank: number; xp: number; /* TODO */ };
export type Challenge = { id: string; name: string; xpReward: number; /* TODO */ };
