// features/multiplayer/utils/streak.ts

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
}

export type StreakTier = "none" | "subtle" | "streak3" | "streak5";

/**
 * Creates a clean initial streak state for a new session or match.
 */
export function createInitialStreakState(): StreakState {
  return {
    currentStreak: 0,
    bestStreak: 0,
  };
}

/**
 * Pure state transition function for recording an answer.
 * - Correct answer increments currentStreak and updates bestStreak if exceeded.
 * - Incorrect answer resets currentStreak to 0 while preserving bestStreak.
 */
export function recordStreakAnswer(state: StreakState, isCorrect: boolean): StreakState {
  if (isCorrect) {
    const nextStreak = state.currentStreak + 1;
    return {
      currentStreak: nextStreak,
      bestStreak: Math.max(state.bestStreak, nextStreak),
    };
  }

  return {
    currentStreak: 0,
    bestStreak: state.bestStreak,
  };
}

/**
 * Resets streak state when transitioning to a new match.
 */
export function resetStreakState(): StreakState {
  return createInitialStreakState();
}

/**
 * Maps streak count to UX tier:
 * - 0–1: 'none' (no major celebration)
 * - 2: 'subtle' (subtle indicator)
 * - 3–4: 'streak3' (e.g. "🔥 3 STREAK")
 * - 5+: 'streak5' (more prominent but restrained feedback)
 */
export function getStreakTier(streak: number): StreakTier {
  if (streak >= 5) return "streak5";
  if (streak >= 3) return "streak3";
  if (streak >= 2) return "subtle";
  return "none";
}
