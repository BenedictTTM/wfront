"use client";
// features/multiplayer/components/ParticipantRail.tsx

import React from "react";
import { Crown, Check, X, Scale, Zap } from "lucide-react";
import { ParticipantState, MatchState, RoundRevealData } from "../types";
import { StreakBadge } from "./StreakBadge";
import { computeCompetitiveState, MatchLeadStatus } from "../utils/tension";
import { computeFinalRoundInfo } from "../utils/final-round";

interface ParticipantRailProps {
  participants: ParticipantState[];
  currentUserId: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  matchState?: MatchState | null;
  roundReveal?: RoundRevealData | null;
  isAnswerLocked?: boolean;
  currentStreak?: number;
}

function useAnimatedScore(targetScore: number): number {
  const [displayScore, setDisplayScore] = React.useState(targetScore);
  const animRef = React.useRef<number | null>(null);
  const prevTargetRef = React.useRef(targetScore);

  React.useEffect(() => {
    // If user prefers reduced motion, update immediately without animation
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayScore(targetScore);
      prevTargetRef.current = targetScore;
      return;
    }

    const startScore = prevTargetRef.current;
    const diff = targetScore - startScore;

    if (diff === 0) {
      setDisplayScore(targetScore);
      return;
    }

    // 400ms duration: fast, subtle, responsive
    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + diff * ease);

      setDisplayScore(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayScore(targetScore);
        prevTargetRef.current = targetScore;
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [targetScore]);

  return displayScore;
}

export function ParticipantRail({
  participants,
  currentUserId,
  totalQuestions,
  currentQuestionIndex,
  matchState,
  roundReveal,
  isAnswerLocked = false,
  currentStreak = 0,
}: ParticipantRailProps) {
  const me = participants.find((p) => p.id === currentUserId);
  const opponent = participants.find((p) => p.id !== currentUserId);

  // Derived round evaluation results (only present during ROUND_REVEAL)
  const myRoundResult = roundReveal?.results.find((r) => r.participantId === currentUserId);
  const opponentRoundResult = roundReveal?.results.find((r) => r.participantId !== currentUserId);

  const myBaseScore = me?.score ?? 0;
  const opponentBaseScore = opponent?.score ?? 0;

  // Use server round reveal newScore directly when available for instant truth
  const myTargetScore = matchState === "ROUND_REVEAL" && myRoundResult ? myRoundResult.newScore : myBaseScore;
  const opponentTargetScore = matchState === "ROUND_REVEAL" && opponentRoundResult ? opponentRoundResult.newScore : opponentBaseScore;

  const animatedMyScore = useAnimatedScore(myTargetScore);
  const animatedOpponentScore = useAnimatedScore(opponentTargetScore);

  const scoreDiff = myTargetScore - opponentTargetScore;

  const currentRoundNum = currentQuestionIndex + 1;
  const questionsRemaining = Math.max(0, totalQuestions - currentRoundNum);
  const progressPercent = totalQuestions > 0 ? (currentRoundNum / totalQuestions) * 100 : 0;

  const finalRound = computeFinalRoundInfo(currentQuestionIndex, totalQuestions);

  const [prevLeadStatus, setPrevLeadStatus] = React.useState<MatchLeadStatus | null>(null);

  const competitive = computeCompetitiveState(
    myTargetScore,
    opponentTargetScore,
    questionsRemaining,
    prevLeadStatus
  );

  React.useEffect(() => {
    setPrevLeadStatus(competitive.leadStatus);
  }, [competitive.leadStatus]);

  const myDisplayName = me?.gamerTag || (me?.name && !me.name.includes('@') ? me.name : "You");
  const opponentDisplayName = opponent?.gamerTag || (opponent?.name && !opponent.name.includes('@') ? opponent.name : "Opponent");
  const myInitial = myDisplayName.trim().charAt(0).toUpperCase();
  const opponentInitial = opponentDisplayName.trim().charAt(0).toUpperCase();

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Question Progress Header ── */}
      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-text-primary text-sm tracking-tight">
              Question {currentRoundNum} of {totalQuestions}
            </span>
            {finalRound.badgeText && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase ${finalRound.badgeClass}`}
              >
                {finalRound.badgeText}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] font-bold ${
              finalRound.isFinalQuestion
                ? "text-amber-700 dark:text-amber-300 font-black"
                : "text-text-secondary"
            }`}
          >
            {finalRound.isFinalQuestion
              ? "Deciding Question"
              : questionsRemaining === 0
              ? "Final Question"
              : `${questionsRemaining} remaining`}
          </span>
        </div>

        {/* Progress Track */}
        <div
          className={`w-full h-2 bg-surface-muted rounded-full overflow-hidden border transition-all duration-300 ${
            finalRound.isFinalQuestion
              ? "border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              : "border-border/40"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${finalRound.progressStyle}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Competitive Tension Status Pill ── */}
      <div className="flex items-center justify-between px-1 -my-0.5 text-[11px] font-black tracking-wide min-h-[22px]">
        <div className="flex items-center gap-1.5 min-w-0">
          {competitive.statusType === "you_took_lead" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/70 text-emerald-800 dark:text-emerald-200 animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
              <Crown size={12} className="text-amber-500 shrink-0" />
              <span>YOU TOOK THE LEAD! (+{scoreDiff})</span>
            </span>
          ) : competitive.statusType === "you_ahead" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-600/40 text-emerald-800 dark:text-emerald-200">
              <Crown size={11} className="text-amber-500 shrink-0" />
              <span>YOU&apos;RE AHEAD (+{scoreDiff})</span>
              {competitive.isCloseMatch && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 font-black">
                  Close
                </span>
              )}
            </span>
          ) : competitive.statusType === "match_tied" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted border border-border text-text-secondary">
              <Scale size={11} className="shrink-0" />
              <span>MATCH TIED</span>
            </span>
          ) : competitive.statusType === "comeback_window" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/60 text-amber-800 dark:text-amber-200 animate-in fade-in duration-300 motion-reduce:animate-none">
              <Zap size={11} className="text-amber-500 shrink-0" />
              <span>COMEBACK WINDOW • -{Math.abs(scoreDiff)} pts</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted/60 border border-border/40 text-text-secondary">
              <span>OPPONENT IS LEADING (+{Math.abs(scoreDiff)})</span>
            </span>
          )}
        </div>

        {/* Tension / Momentum / Final Round Note */}
        {finalRound.isFinalQuestion ? (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1 shrink-0 animate-in fade-in duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
            Deciding Question
          </span>
        ) : (
          competitive.isCloseMatch && competitive.statusType !== "match_tied" && (
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
              Within 1 Question
            </span>
          )
        )}
      </div>

      {/* ── Player vs Opponent Cards ── */}
      <div className="grid grid-cols-2 gap-2.5 items-stretch relative">
        {/* PLAYER (YOU) */}
        <div
          className={`flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border-[2px] transition-all duration-300 motion-reduce:transition-none relative ${
            finalRound.cardBorderClass
          } ${
            matchState === "ROUND_REVEAL" && myRoundResult
              ? myRoundResult.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/70 shadow-[0_3px_0_rgba(16,185,129,0.25)]"
                : "bg-rose-500/10 border-rose-500/60 shadow-[0_3px_0_rgba(244,63,94,0.2)]"
              : scoreDiff > 0
              ? competitive.isCloseMatch
                ? "bg-emerald-500/15 border-emerald-600 shadow-[0_3px_0_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/30"
                : "bg-emerald-500/10 border-emerald-600/60 shadow-[0_3px_0_rgba(16,185,129,0.25)]"
              : competitive.isCloseMatch
              ? "bg-surface border-amber-500/40 shadow-[0_2px_0_rgba(20,24,39,0.9)]"
              : "bg-surface border-border shadow-[0_2px_0_rgba(20,24,39,0.9)]"
          }`}
        >
          {/* Header: You badge & Avatar */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-primary border-[1.5px] border-border flex items-center justify-center font-black text-[11px] shrink-0 text-text-primary">
                {myInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-text-primary truncate">
                  {myDisplayName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {currentStreak >= 2 && (
                <StreakBadge streak={currentStreak} size="sm" />
              )}
              <span className="px-2 py-0.5 bg-primary/20 border border-primary/60 rounded-md text-[9px] font-black uppercase tracking-wider text-text-primary shrink-0">
                YOU
              </span>
            </div>
          </div>

          {/* Real-Time Player Status */}
          <div
            className="flex items-center gap-1 my-1 text-[10px] font-bold min-h-[18px]"
            aria-live="polite"
            aria-atomic="true"
          >
            {matchState === "QUESTION_ACTIVE" ? (
              isAnswerLocked ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Check size={11} className="stroke-[3]" />
                  Answer locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
                  Thinking...
                </span>
              )
            ) : matchState === "ROUND_REVEAL" && myRoundResult ? (
              myRoundResult.isCorrect ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Check size={11} className="stroke-[3]" />
                  Correct! (+{myRoundResult.pointsEarned})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
                  <X size={11} className="stroke-[3]" />
                  Missed!
                </span>
              )
            ) : matchState === "FINISHED" ? (
              <span className="text-text-secondary">Finished</span>
            ) : (
              <span className="text-text-secondary">Ready</span>
            )}
          </div>

          {/* Score & Status */}
          <div className="flex items-baseline justify-between mt-auto pt-1 border-t border-border/10">
            <div className="flex items-baseline gap-1 relative">
              <span className="text-2xl sm:text-3xl font-black text-text-primary tabular-nums tracking-tight">
                {animatedMyScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">
                pts
              </span>
              {/* Positive score movement badge */}
              {matchState === "ROUND_REVEAL" && myRoundResult && myRoundResult.pointsEarned > 0 && (
                <span
                  className="absolute -top-3 left-0 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
                  aria-hidden="true"
                >
                  +{myRoundResult.pointsEarned}
                </span>
              )}
            </div>

            {/* Lead Status Pill */}
            {scoreDiff > 0 ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                <Crown size={10} className="stroke-[3]" />
                +{scoreDiff}
              </span>
            ) : scoreDiff < 0 ? (
              <span className="text-[10px] font-bold text-text-secondary tabular-nums">
                {scoreDiff}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-text-secondary">
                Tied
              </span>
            )}
          </div>
        </div>

        {/* OPPONENT */}
        <div
          className={`flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border-[2px] transition-all duration-300 motion-reduce:transition-none relative ${
            finalRound.cardBorderClass
          } ${
            matchState === "ROUND_REVEAL" && opponentRoundResult
              ? opponentRoundResult.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/70 shadow-[0_3px_0_rgba(16,185,129,0.25)]"
                : "bg-rose-500/10 border-rose-500/60 shadow-[0_3px_0_rgba(244,63,94,0.2)]"
              : scoreDiff < 0
              ? competitive.isCloseMatch
                ? "bg-amber-500/15 border-amber-600 shadow-[0_3px_0_rgba(245,158,11,0.35)] ring-1 ring-amber-500/30"
                : "bg-amber-500/10 border-amber-600/60 shadow-[0_3px_0_rgba(245,158,11,0.25)]"
              : competitive.isCloseMatch
              ? "bg-surface-muted/70 border-amber-500/40 shadow-[0_2px_0_rgba(20,24,39,0.9)]"
              : "bg-surface-muted/60 border-border shadow-[0_2px_0_rgba(20,24,39,0.9)]"
          }`}
        >
          {/* Header: Opponent badge & Avatar */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-surface border-[1.5px] border-border flex items-center justify-center font-black text-[11px] shrink-0 text-text-secondary">
                {opponentInitial}
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs font-black text-text-primary truncate">
                  {opponentDisplayName}
                </span>
                <span
                  title={opponent?.isConnected ? "Connected" : "Disconnected"}
                  aria-label={opponent?.isConnected ? "Opponent connected" : "Opponent disconnected"}
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    opponent?.isConnected ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-surface border border-border/40 rounded-md text-[9px] font-black uppercase tracking-wider text-text-secondary shrink-0">
              OPPONENT
            </span>
          </div>

          {/* Real-Time Opponent Status */}
          <div
            className="flex items-center gap-1 my-1 text-[10px] font-bold min-h-[18px]"
            aria-live="polite"
            aria-atomic="true"
          >
            {!opponent?.isConnected ? (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Disconnected
              </span>
            ) : matchState === "QUESTION_ACTIVE" ? (
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse motion-reduce:animate-none" />
                Answering...
              </span>
            ) : matchState === "ROUND_REVEAL" && opponentRoundResult ? (
              opponentRoundResult.isCorrect ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Check size={11} className="stroke-[3]" />
                  Correct! (+{opponentRoundResult.pointsEarned})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
                  <X size={11} className="stroke-[3]" />
                  Missed!
                </span>
              )
            ) : matchState === "FINISHED" ? (
              <span className="text-text-secondary">Finished</span>
            ) : matchState === "LOBBY" ? (
              <span className="text-text-secondary">Waiting...</span>
            ) : (
              <span className="text-text-secondary">Ready</span>
            )}
          </div>

          {/* Score & Status */}
          <div className="flex items-baseline justify-between mt-auto pt-1 border-t border-border/10">
            <div className="flex items-baseline gap-1 relative">
              <span className="text-2xl sm:text-3xl font-black text-text-primary tabular-nums tracking-tight">
                {animatedOpponentScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">
                pts
              </span>
              {/* Positive score movement badge */}
              {matchState === "ROUND_REVEAL" && opponentRoundResult && opponentRoundResult.pointsEarned > 0 && (
                <span
                  className="absolute -top-3 left-0 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
                  aria-hidden="true"
                >
                  +{opponentRoundResult.pointsEarned}
                </span>
              )}
            </div>

            {/* Lead Status Pill */}
            {scoreDiff < 0 ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                <Crown size={10} className="stroke-[3]" />
                +{Math.abs(scoreDiff)}
              </span>
            ) : scoreDiff > 0 ? (
              <span className="text-[10px] font-bold text-text-secondary tabular-nums">
                -{scoreDiff}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-text-secondary">
                Tied
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
