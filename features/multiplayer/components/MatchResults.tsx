"use client";
// features/multiplayer/components/MatchResults.tsx

import React from "react";
import {
  Trophy,
  Swords,
  Scale,
  Crown,
  CheckCircle2,
  XCircle,
  Flame,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  Percent,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MatchEndData, ParticipantState } from "../types";
import { computeMatchOutcome, computePerformanceStats } from "../utils/match-results";

interface MatchResultsProps {
  matchEnd: MatchEndData;
  participants: ParticipantState[];
  currentUserId: string;
  subjectId?: string | null;
  subjectName?: string | null;
  bestStreak?: number;
  stats?: {
    correctCount: number;
    incorrectCount: number;
    questionsCompleted: number;
    totalQuestions: number;
  };
  isRematching?: boolean;
  rematchError?: string | null;
  onRematch?: () => void;
  onBackToMultiplayer?: () => void;
}

export function MatchResults({
  matchEnd,
  participants,
  currentUserId,
  subjectName,
  bestStreak = 0,
  stats,
  isRematching = false,
  rematchError = null,
  onRematch,
  onBackToMultiplayer,
}: MatchResultsProps) {
  const myRanking = matchEnd.rankings.find((r) => r.participantId === currentUserId);
  const oppRanking = matchEnd.rankings.find((r) => r.participantId !== currentUserId);

  const me = participants.find((p) => p.id === currentUserId);
  const opponent = participants.find((p) => p.id !== currentUserId);

  const myScore = myRanking?.score ?? me?.score ?? 0;
  const oppScore = oppRanking?.score ?? opponent?.score ?? 0;
  const oppName = oppRanking?.name ?? opponent?.name ?? "Opponent";
  const myName = myRanking?.name ?? me?.name ?? "You";

  const outcomeInfo = computeMatchOutcome(myScore, oppScore, oppName);
  const performance = computePerformanceStats(
    stats?.correctCount ?? 0,
    stats?.incorrectCount ?? 0,
    stats?.totalQuestions ?? 0,
    bestStreak
  );

  const myInitial = myName.trim().charAt(0).toUpperCase() || "Y";
  const oppInitial = oppName.trim().charAt(0).toUpperCase() || "O";

  return (
    <div className="flex flex-col items-center gap-5 py-3 max-w-lg mx-auto w-full animate-in fade-in duration-300 motion-reduce:animate-none">
      {/* ── 1. Result State Banner ── */}
      <div
        className={`w-full p-6 rounded-2xl border-[2.5px] text-center flex flex-col items-center gap-2.5 shadow-[0_4px_0_rgba(20,24,39,0.9)] ${
          outcomeInfo.outcome === "win"
            ? "bg-amber-500/10 border-amber-600/60"
            : outcomeInfo.outcome === "loss"
            ? "bg-surface border-border"
            : "bg-surface border-amber-500/40"
        }`}
      >
        {/* Outcome Icon */}
        <div className="flex items-center justify-center">
          {outcomeInfo.outcome === "win" ? (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-[2px] border-amber-500/60 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy size={32} className="stroke-[2.2]" />
            </div>
          ) : outcomeInfo.outcome === "loss" ? (
            <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center text-text-secondary">
              <Swords size={30} className="stroke-[2.2]" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-[2px] border-amber-500/50 flex items-center justify-center text-amber-500">
              <Scale size={30} className="stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Outcome Headline & Badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              {outcomeInfo.headline}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${outcomeInfo.badgeClass}`}
            >
              {outcomeInfo.badgeText}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary font-medium">
            {outcomeInfo.summaryText}
          </p>
        </div>
      </div>

      {/* ── 2. Final Scoreboard (Head-to-Head) ── */}
      <div className="w-full flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-0.5">
          Final Score
        </span>

        <div className="w-full grid grid-cols-2 gap-2.5 items-stretch">
          {/* YOU */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border-[2px] flex flex-col justify-between shadow-[0_2px_0_rgba(20,24,39,0.9)] ${
              outcomeInfo.outcome === "win"
                ? "bg-emerald-500/10 border-emerald-600/70"
                : "bg-surface border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-primary border-[1.5px] border-border flex items-center justify-center font-black text-[11px] shrink-0 text-text-primary">
                  {myInitial}
                </div>
                <span className="text-xs font-black text-text-primary truncate">
                  {myName}
                </span>
              </div>
              <span className="px-1.5 py-0.2 bg-primary/20 border border-primary/50 rounded text-[9px] font-black uppercase text-text-primary shrink-0">
                YOU
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl sm:text-4xl font-black text-text-primary tabular-nums tracking-tight">
                {myScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">pts</span>
            </div>

            <div className="pt-2 border-t border-border/10">
              {outcomeInfo.outcome === "win" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                  <Crown size={12} className="text-amber-500 shrink-0" />
                  +{outcomeInfo.scoreDiff} lead
                </span>
              ) : outcomeInfo.outcome === "loss" ? (
                <span className="text-[11px] font-bold text-text-secondary">
                  -{outcomeInfo.scoreDiff} deficit
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Tied
                </span>
              )}
            </div>
          </div>

          {/* OPPONENT */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border-[2px] flex flex-col justify-between shadow-[0_2px_0_rgba(20,24,39,0.9)] ${
              outcomeInfo.outcome === "loss"
                ? "bg-amber-500/10 border-amber-600/70"
                : "bg-surface-muted/60 border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-surface border-[1.5px] border-border flex items-center justify-center font-black text-[11px] shrink-0 text-text-secondary">
                  {oppInitial}
                </div>
                <span className="text-xs font-black text-text-primary truncate">
                  {oppName}
                </span>
              </div>
              <span className="px-1.5 py-0.2 bg-surface border border-border/40 rounded text-[9px] font-black uppercase text-text-secondary shrink-0">
                OPPONENT
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl sm:text-4xl font-black text-text-primary tabular-nums tracking-tight">
                {oppScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">pts</span>
            </div>

            <div className="pt-2 border-t border-border/10">
              {outcomeInfo.outcome === "loss" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                  <Crown size={12} className="text-amber-500 shrink-0" />
                  +{outcomeInfo.scoreDiff} lead
                </span>
              ) : outcomeInfo.outcome === "win" ? (
                <span className="text-[11px] font-bold text-text-secondary">
                  -{outcomeInfo.scoreDiff} deficit
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Tied
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Performance Statistics ── */}
      <div className="w-full flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-0.5">
          Match Performance
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Accuracy */}
          <div className="p-3 bg-surface border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-[10px] font-black uppercase tracking-wider">Accuracy</span>
              <Percent size={13} className="text-primary" />
            </div>
            <span className="text-xl font-black text-text-primary tabular-nums">
              {performance.accuracy}%
            </span>
          </div>

          {/* Correct Answers */}
          <div className="p-3 bg-surface border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-[10px] font-black uppercase tracking-wider">Correct</span>
              <CheckCircle2 size={13} className="text-emerald-500" />
            </div>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
              {performance.correctCount}
            </span>
          </div>

          {/* Incorrect Answers */}
          <div className="p-3 bg-surface border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-[10px] font-black uppercase tracking-wider">Incorrect</span>
              <XCircle size={13} className="text-rose-500" />
            </div>
            <span className="text-xl font-black text-rose-700 dark:text-rose-300 tabular-nums">
              {performance.incorrectCount}
            </span>
          </div>

          {/* Best Streak */}
          <div className="p-3 bg-surface border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-[10px] font-black uppercase tracking-wider">Best Streak</span>
              <Flame size={13} className="text-amber-500" />
            </div>
            <span className="text-xl font-black text-text-primary tabular-nums">
              {performance.bestStreak >= 2 ? (
                <span className="text-amber-700 dark:text-amber-300">
                  {performance.bestStreak}
                </span>
              ) : (
                <span className="text-text-secondary">—</span>
              )}
            </span>
          </div>
        </div>

        {/* Questions Completed Summary Pill */}
        <div className="px-3.5 py-2 rounded-xl bg-surface-muted/60 border border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-secondary font-bold">
            <HelpCircle size={14} className="text-text-secondary" />
            <span>Questions Completed</span>
          </div>
          <span className="font-black text-text-primary tabular-nums">
            {performance.questionsCompleted}
            {performance.totalQuestions > 0 ? ` of ${performance.totalQuestions}` : ""}
          </span>
        </div>
      </div>

      {/* ── 4. Action CTAs ── */}
      <div className="w-full flex flex-col gap-2.5 pt-2">
        {/* Error message if queue entry failed */}
        {rematchError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{rematchError}</span>
          </div>
        )}

        {/* Primary CTA: REMATCH */}
        <button
          type="button"
          onClick={onRematch}
          disabled={isRematching}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-text-primary border-[2px] border-border rounded-2xl text-sm font-black shadow-[0_4px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRematching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>FINDING OPPONENT…</span>
            </>
          ) : (
            <>
              <RotateCcw size={16} className="stroke-[2.5]" />
              <span>REMATCH</span>
            </>
          )}
        </button>

        {/* Secondary CTA: BACK TO MULTIPLAYER */}
        <button
          type="button"
          onClick={onBackToMultiplayer}
          disabled={isRematching}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface text-text-primary border-[2px] border-border rounded-2xl text-xs sm:text-sm font-black shadow-[0_2px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} />
          <span>BACK TO MULTIPLAYER</span>
        </button>

        {/* Clarifying subtext: No fake rematch, clear transparency */}
        {subjectName && (
          <p className="text-center text-[10px] font-bold text-text-secondary mt-0.5">
            Searches for your next 1v1 match in{" "}
            <span className="text-text-primary font-black">{subjectName}</span>
          </p>
        )}
      </div>
    </div>
  );
}
