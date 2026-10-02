// features/multiplayer/utils/final-round.ts

export type FinalRoundStage = "normal" | "final_3" | "final_2" | "final_question";

export interface FinalRoundInfo {
  stage: FinalRoundStage;
  questionsLeft: number;
  isFinalStretch: boolean; // 3, 2, or 1 left
  isFinalQuestion: boolean; // 1 left
  stageLabel: string;
  badgeText: string;
  badgeClass: string;
  stageTagline: string;
  progressStyle: string;
  cardBorderClass: string;
}

/**
 * Determines the final round stage based strictly on existing question indices and total questions.
 * UX progression:
 * Normal questions (> 3 left) -> FINAL 3 (3 left) -> FINAL 2 (2 left) -> FINAL QUESTION (1 left) -> RESULT
 */
export function getFinalRoundStage(
  currentQuestionIndex: number,
  totalQuestions: number
): FinalRoundStage {
  if (totalQuestions <= 0 || currentQuestionIndex < 0 || currentQuestionIndex >= totalQuestions) {
    return "normal";
  }
  const questionsLeft = totalQuestions - currentQuestionIndex;

  if (questionsLeft === 1) return "final_question";
  if (questionsLeft === 2) return "final_2";
  if (questionsLeft === 3) return "final_3";
  return "normal";
}

/**
 * Computes presentation metadata for the current round stage, scaling visual intensity
 * without altering question logic, scoring, or timers.
 */
export function computeFinalRoundInfo(
  currentQuestionIndex: number,
  totalQuestions: number
): FinalRoundInfo {
  const stage = getFinalRoundStage(currentQuestionIndex, totalQuestions);
  const questionsLeft = Math.max(0, totalQuestions - currentQuestionIndex);

  switch (stage) {
    case "final_question":
      return {
        stage,
        questionsLeft,
        isFinalStretch: true,
        isFinalQuestion: true,
        stageLabel: "Final Question",
        badgeText: "FINAL QUESTION",
        badgeClass:
          "bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-sm animate-in fade-in duration-300",
        stageTagline: "Deciding Question",
        progressStyle: "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
        cardBorderClass: "ring-1 ring-amber-500/40",
      };
    case "final_2":
      return {
        stage,
        questionsLeft,
        isFinalStretch: true,
        isFinalQuestion: false,
        stageLabel: "Final 2 Questions",
        badgeText: "FINAL 2",
        badgeClass:
          "bg-amber-500/20 text-amber-800 dark:text-amber-200 font-black border border-amber-500/60 animate-in fade-in duration-300",
        stageTagline: "Penultimate Round",
        progressStyle: "bg-gradient-to-r from-primary via-amber-500 to-amber-400",
        cardBorderClass: "ring-1 ring-amber-500/20",
      };
    case "final_3":
      return {
        stage,
        questionsLeft,
        isFinalStretch: true,
        isFinalQuestion: false,
        stageLabel: "Final 3 Questions",
        badgeText: "FINAL 3",
        badgeClass:
          "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40 animate-in fade-in duration-300",
        stageTagline: "Final 3 Rounds",
        progressStyle: "bg-gradient-to-r from-primary to-amber-500",
        cardBorderClass: "",
      };
    default:
      return {
        stage: "normal",
        questionsLeft,
        isFinalStretch: false,
        isFinalQuestion: false,
        stageLabel: `${Math.max(0, questionsLeft - 1)} remaining`,
        badgeText: "",
        badgeClass: "",
        stageTagline: "",
        progressStyle: "bg-primary",
        cardBorderClass: "",
      };
  }
}
