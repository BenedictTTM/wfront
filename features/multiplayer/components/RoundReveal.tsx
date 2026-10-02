"use client";
// features/multiplayer/components/RoundReveal.tsx

import React from "react";
import { CheckCircle2, XCircle, Zap, Flame, Crown } from "lucide-react";
import { RoundRevealData, ParticipantState } from "../types";

interface RoundRevealProps {
  revealData: RoundRevealData;
  currentQuestion: { options: Array<{ id: string; text: string }> };
  participants: ParticipantState[];
  currentUserId: string;
  selectedOptionId: string | null;
}

export function RoundReveal({
  revealData,
  currentQuestion,
  participants,
  currentUserId,
  selectedOptionId,
}: RoundRevealProps) {
  const { correctOptionId, results } = revealData;

  const myResult = results.find((r) => r.participantId === currentUserId);
  const oppResult = results.find((r) => r.participantId !== currentUserId);
  const isCorrect = myResult?.isCorrect ?? false;

  const myScore = myResult?.newScore ?? 0;
  const oppScore = oppResult?.newScore ?? 0;
  const diff = myScore - oppScore;

  const correctOptionText =
    currentQuestion.options.find((o) => o.id === correctOptionId)?.text ?? correctOptionId;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Correct/Wrong Banner ── */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border-[2px] shadow-[0_3px_0_rgba(20,24,39,0.9)] ${
          isCorrect
            ? "bg-emerald-500/10 border-emerald-600/60"
            : "bg-rose-500/10 border-rose-600/60"
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 size={26} className="text-emerald-600 shrink-0" />
        ) : (
          <XCircle size={26} className="text-rose-600 shrink-0" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-sm font-black ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
          >
            {isCorrect ? "Correct Answer!" : selectedOptionId === "__TIMEOUT__" ? "Time Ran Out" : "Incorrect"}
          </span>
          <span className="text-xs text-text-secondary font-medium truncate">
            Correct: <span className="font-black text-text-primary">{correctOptionText}</span>
          </span>
        </div>

        {myResult && myResult.pointsEarned > 0 && (
          <div className="ml-auto text-right shrink-0">
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              +{myResult.pointsEarned}
            </span>
            <span className="block text-[9px] font-bold text-text-secondary uppercase">pts</span>
          </div>
        )}
      </div>

      {/* ── Points Breakdown (Speed & Streak) ── */}
      {myResult && myResult.pointsEarned > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-surface border-[2px] border-border rounded-xl text-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap size={11} className="text-primary" />
              <span className="text-[10px] font-black uppercase text-text-secondary">Speed</span>
            </div>
            <span className="text-sm font-black text-text-primary">
              +{myResult.speedBonus}
            </span>
          </div>
          <div className="p-2.5 bg-surface border-[2px] border-border rounded-xl text-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame size={11} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase text-text-secondary">Streak</span>
            </div>
            <span className="text-sm font-black text-text-primary">
              +{myResult.streakBonus}
            </span>
          </div>
          <div className="p-2.5 bg-surface border-[2px] border-border rounded-xl text-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <span className="block text-[10px] font-black uppercase text-text-secondary mb-0.5">Round</span>
            <span className="text-sm font-black text-emerald-600">
              +{myResult.pointsEarned}
            </span>
          </div>
        </div>
      )}

      {/* ── Updated Standings ── */}
      <div className="flex flex-col gap-2 p-3 bg-surface border-[2px] border-border rounded-2xl shadow-[0_2px_0_rgba(20,24,39,0.9)]">
        <div className="flex justify-between items-center px-1 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
            Score Standings
          </span>
          <span className="text-[11px] font-black">
            {diff > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-300 font-black">You lead by +{diff}</span>
            ) : diff < 0 ? (
              <span className="text-amber-700 dark:text-amber-300 font-black">Opponent leads by +{Math.abs(diff)}</span>
            ) : (
              <span className="text-text-secondary">Scores are tied</span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[...results]
            .sort((a, b) => b.newScore - a.newScore)
            .map((result, idx) => {
              const participant = participants.find((p) => p.id === result.participantId);
              const isSelf = result.participantId === currentUserId;
              const isLeading = idx === 0 && results.length > 1 && results[0].newScore > results[1].newScore;

              return (
                <div
                  key={result.participantId}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-[1.5px] ${
                    isSelf ? "bg-primary/10 border-primary/50" : "bg-surface-muted/50 border-border/40"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border shrink-0 ${
                      result.isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-rose-500 bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {result.isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs font-black text-text-primary truncate">
                      {isSelf ? "You" : participant?.name ?? "Opponent"}
                    </span>
                    {isLeading && (
                      <Crown size={12} className="text-amber-500 shrink-0" />
                    )}
                  </div>

                  {result.pointsEarned > 0 && (
                    <span className="text-[11px] font-black text-emerald-600">
                      +{result.pointsEarned}
                    </span>
                  )}

                  <span className="text-sm font-black text-text-primary tabular-nums">
                    {result.newScore.toLocaleString()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      <p className="text-center text-xs text-text-secondary font-bold">
        Next question starting shortly…
      </p>
    </div>
  );
}
