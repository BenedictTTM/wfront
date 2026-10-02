// features/multiplayer/utils/tension.ts

export type MatchLeadStatus = "leading" | "trailing" | "tied";

export type CompetitiveStatusType =
  | "you_took_lead"
  | "you_ahead"
  | "match_tied"
  | "comeback_window"
  | "opponent_leads";

export interface CompetitiveState {
  myScore: number;
  opponentScore: number;
  scoreDiff: number; // myScore - opponentScore
  leadStatus: MatchLeadStatus;
  isLeadChange: boolean;
  statusType: CompetitiveStatusType;
  statusText: string;
  isCloseMatch: boolean;
  canComebackSingleQuestion: boolean;
  questionsRemaining: number;
}

/**
 * Maximum possible points a participant can achieve in a single question:
 * 100 base + 50 max speed bonus + 50 max streak bonus = 200 pts.
 * (Directly mirrors MultiplayerEngine rules in backend).
 */
export const MAX_POINTS_PER_QUESTION = 200;

/**
 * Computes deterministic competitive tension state based purely on existing scores and questions.
 * No hidden probability, no artificial bonuses, no fake predictions.
 */
export function computeCompetitiveState(
  myScore: number,
  opponentScore: number,
  questionsRemaining: number,
  prevLeadStatus: MatchLeadStatus | null = null
): CompetitiveState {
  const scoreDiff = myScore - opponentScore;
  const absDiff = Math.abs(scoreDiff);

  let leadStatus: MatchLeadStatus;
  if (scoreDiff > 0) {
    leadStatus = "leading";
  } else if (scoreDiff < 0) {
    leadStatus = "trailing";
  } else {
    leadStatus = "tied";
  }

  const isLeadChange =
    prevLeadStatus !== null &&
    prevLeadStatus !== leadStatus &&
    (prevLeadStatus === "trailing" || prevLeadStatus === "tied") &&
    leadStatus === "leading";

  // A match is close if score gap is within 100 points (1 base correct answer)
  // and at least one player has scored.
  const isCloseMatch = absDiff <= 100 && (myScore > 0 || opponentScore > 0);

  // Comeback window: trailing by <= 200 points with questions remaining,
  // meaning a single round can flip or tie the lead.
  const deficit = Math.max(0, -scoreDiff);
  const canComebackSingleQuestion =
    leadStatus === "trailing" && deficit <= MAX_POINTS_PER_QUESTION && questionsRemaining >= 1;

  let statusType: CompetitiveStatusType;
  let statusText: string;

  if (leadStatus === "leading") {
    if (isLeadChange) {
      statusType = "you_took_lead";
      statusText = "YOU TOOK THE LEAD";
    } else {
      statusType = "you_ahead";
      statusText = isCloseMatch ? "YOU'RE AHEAD (CLOSE)" : "YOU'RE AHEAD";
    }
  } else if (leadStatus === "tied") {
    statusType = "match_tied";
    statusText = "MATCH TIED";
  } else {
    // Trailing
    if (canComebackSingleQuestion) {
      statusType = "comeback_window";
      statusText = "COMEBACK WINDOW";
    } else {
      statusType = "opponent_leads";
      statusText = "OPPONENT IS LEADING";
    }
  }

  return {
    myScore,
    opponentScore,
    scoreDiff,
    leadStatus,
    isLeadChange,
    statusType,
    statusText,
    isCloseMatch,
    canComebackSingleQuestion,
    questionsRemaining,
  };
}
