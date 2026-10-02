"use client";
// features/multiplayer/hooks/use-streak.ts

import { useCallback, useState } from "react";
import {
  createInitialStreakState,
  getStreakTier,
  recordStreakAnswer,
  resetStreakState,
  StreakState,
  StreakTier,
} from "../utils/streak";

export interface UseStreakReturn {
  currentStreak: number;
  bestStreak: number;
  tier: StreakTier;
  recordAnswer: (isCorrect: boolean) => void;
  resetStreak: () => void;
}

/**
 * Reusable React hook for tracking consecutive correct answers during a multiplayer match.
 * - Handles correct increment, incorrect reset, and next-match clear.
 * - 100% in-memory: no fake localStorage persistence across sessions or reloads.
 */
export function useStreak(matchId?: string | null): UseStreakReturn {
  const [streakState, setStreakState] = useState<StreakState>(createInitialStreakState);
  const [prevMatchId, setPrevMatchId] = useState<string | null | undefined>(matchId);

  // Automatically reset streak whenever matchId changes (new match)
  if (prevMatchId !== matchId) {
    setPrevMatchId(matchId);
    setStreakState(createInitialStreakState());
  }

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setStreakState((prev) => recordStreakAnswer(prev, isCorrect));
  }, []);

  const resetStreak = useCallback(() => {
    setStreakState(resetStreakState());
  }, []);

  const tier: StreakTier = getStreakTier(streakState.currentStreak);

  return {
    currentStreak: streakState.currentStreak,
    bestStreak: streakState.bestStreak,
    tier,
    recordAnswer,
    resetStreak,
  };
}
