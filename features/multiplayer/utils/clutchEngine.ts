// features/multiplayer/utils/clutchEngine.ts

export interface GameState {
  currentQuestion: number; // 1 to 10
  totalQuestions: number;  // 10
  playerScore: number;
  opponentScore: number;
}

export type MatchStatus = 'COMFORTABLE' | 'CLUTCH_WINDOW' | 'DECIDED' | 'TIED';

export interface ClutchAnalysis {
  status: MatchStatus;
  scoreGap: number;
  maxRemainingScore: number;
  isComebackPossible: boolean;
  headlineCopy: string;
  subCopy: string;
}

/**
 * Scoring Rules & Constants:
 * Standard correct answer: 100 pts.
 * Max speed bonus: 20 pts.
 * Max streak bonus: 15 pts.
 * Total max points achievable per single question: 135 pts.
 */
export const STANDARD_BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 20;
export const MAX_STREAK_BONUS = 15;
export const MAX_POINTS_PER_QUESTION = 135;

/**
 * Pure calculation engine for the endgame clutch state of a 1v1 quiz duel.
 * Evaluates questions 8, 9, and 10 deterministically.
 */
export function evaluateClutchState(state: GameState): ClutchAnalysis {
  const { currentQuestion, totalQuestions, playerScore, opponentScore } = state;

  // Remaining questions including the active question (e.g. Q9 of 10 -> 10 - 9 + 1 = 2)
  const remainingQuestions = Math.max(0, totalQuestions - currentQuestion + 1);
  const maxRemainingScore = remainingQuestions * MAX_POINTS_PER_QUESTION;
  const scoreGap = Math.abs(playerScore - opponentScore);

  // 1. Perfect Tie
  if (scoreGap === 0) {
    return {
      status: 'TIED',
      scoreGap: 0,
      maxRemainingScore,
      isComebackPossible: true,
      headlineCopy: 'DEAD HEAT',
      subCopy: `Scores level • ${remainingQuestions} questions remaining • Match is live.`,
    };
  }

  // 2. Mathematically Decided (deficit exceeds maximum possible remaining points)
  if (scoreGap > maxRemainingScore) {
    return {
      status: 'DECIDED',
      scoreGap,
      maxRemainingScore,
      isComebackPossible: false,
      headlineCopy: 'MASTERY TARGET ACTIVE',
      subCopy: 'Score locked — finish above 80% accuracy to protect subject rating.',
    };
  }

  // 3. Clutch Window (Endgame questions 8, 9, 10 where deficit is mathematically recoverable)
  if (currentQuestion >= 8 && scoreGap <= maxRemainingScore) {
    return {
      status: 'CLUTCH_WINDOW',
      scoreGap,
      maxRemainingScore,
      isComebackPossible: true,
      headlineCopy: '⚡ CLUTCH WINDOW ACTIVE',
      subCopy: `Gap: ${scoreGap} pts • ${remainingQuestions} questions remaining • Match is live.`,
    };
  }

  // 4. Comfortable / Regular Pace (Early or mid-match with recoverable gap)
  return {
    status: 'COMFORTABLE',
    scoreGap,
    maxRemainingScore,
    isComebackPossible: true,
    headlineCopy: 'IN STRIDE',
    subCopy: `Gap: ${scoreGap} pts • ${remainingQuestions} questions remaining.`,
  };
}
