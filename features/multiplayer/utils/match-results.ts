// features/multiplayer/utils/match-results.ts

export type MatchOutcome = "win" | "loss" | "draw";

export interface MatchOutcomeInfo {
  outcome: MatchOutcome;
  headline: string;
  badgeText: string;
  badgeClass: string;
  myScore: number;
  opponentScore: number;
  scoreDiff: number;
  summaryText: string;
}

export interface MatchPerformanceStats {
  correctCount: number;
  incorrectCount: number;
  questionsCompleted: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
}

/**
 * Deterministically computes the match outcome (WIN, LOSS, or DRAW)
 * strictly from final scores.
 */
export function computeMatchOutcome(
  myScore: number,
  opponentScore: number,
  opponentName: string = "Opponent"
): MatchOutcomeInfo {
  const scoreDiff = Math.abs(myScore - opponentScore);

  if (myScore > opponentScore) {
    return {
      outcome: "win",
      headline: "VICTORY",
      badgeText: "YOU WON",
      badgeClass:
        "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/60 shadow-[0_1px_2px_rgba(16,185,129,0.2)]",
      myScore,
      opponentScore,
      scoreDiff,
      summaryText: `You won the match by +${scoreDiff.toLocaleString()} points.`,
    };
  }

  if (myScore < opponentScore) {
    return {
      outcome: "loss",
      headline: "DEFEAT",
      badgeText: "OPPONENT WON",
      badgeClass:
        "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/40",
      myScore,
      opponentScore,
      scoreDiff,
      summaryText: `${opponentName} took the win by ${scoreDiff.toLocaleString()} points.`,
    };
  }

  return {
    outcome: "draw",
    headline: "DRAW",
    badgeText: "MATCH TIED",
    badgeClass:
      "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50",
    myScore,
    opponentScore,
    scoreDiff: 0,
    summaryText: `Match ended in a draw at ${myScore.toLocaleString()} points each.`,
  };
}

/**
 * Derives performance statistics from recorded answers in the current match.
 */
export function computePerformanceStats(
  correctCount: number,
  incorrectCount: number,
  totalQuestions: number,
  bestStreak: number = 0
): MatchPerformanceStats {
  const completed = Math.max(0, correctCount + incorrectCount);
  const safeTotal = Math.max(completed, totalQuestions);
  const accuracy = completed > 0 ? Math.round((correctCount / completed) * 100) : 0;

  return {
    correctCount: Math.max(0, correctCount),
    incorrectCount: Math.max(0, incorrectCount),
    questionsCompleted: completed,
    totalQuestions: safeTotal,
    accuracy,
    bestStreak: Math.max(0, bestStreak),
  };
}
