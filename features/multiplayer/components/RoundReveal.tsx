"use client";
// features/multiplayer/components/RoundReveal.tsx

import React from "react";
import { CheckCircle2, XCircle, Zap, Flame } from "lucide-react";
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
  const isCorrect = myResult?.isCorrect ?? false;

  const correctOptionText =
    currentQuestion.options.find((o) => o.id === correctOptionId)?.text ?? correctOptionId;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Correct/Wrong banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border-[2px] shadow-[0_4px_0_rgba(20,24,39,0.9)] ${
          isCorrect
            ? "bg-emerald-500/10 border-emerald-500/40"
            : "bg-rose-500/10 border-rose-500/40"
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
        ) : (
          <XCircle size={28} className="text-rose-500 shrink-0" />
        )}
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-sm font-black ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}
          >
            {isCorrect ? "Correct!" : selectedOptionId === "__TIMEOUT__" ? "Time's up!" : "Wrong answer"}
          </span>
          <span className="text-xs text-text-secondary font-medium">
            Correct answer:{" "}
            <span className="font-black text-text-primary">{correctOptionText}</span>
          </span>
        </div>

        {myResult && myResult.pointsEarned > 0 && (
          <div className="ml-auto text-right">
            <span className="text-lg font-black text-emerald-400">
              +{myResult.pointsEarned}
            </span>
            <span className="block text-[9px] font-bold text-text-secondary uppercase tracking-wide">pts</span>
          </div>
        )}
      </div>

      {/* Bonus breakdown */}
      {myResult && myResult.pointsEarned > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-surface border-[2px] border-border rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap size={12} className="text-primary" />
              <span className="text-[10px] font-black uppercase text-text-secondary">Speed</span>
            </div>
            <span className="text-base font-black text-text-primary">
              +{myResult.speedBonus}
            </span>
          </div>
          <div className="flex-1 p-3 bg-surface border-[2px] border-border rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame size={12} className="text-orange-400" />
              <span className="text-[10px] font-black uppercase text-text-secondary">Streak</span>
            </div>
            <span className="text-base font-black text-text-primary">
              +{myResult.streakBonus}
            </span>
          </div>
          <div className="flex-1 p-3 bg-surface border-[2px] border-border rounded-xl text-center">
            <span className="block text-[10px] font-black uppercase text-text-secondary mb-0.5">Total</span>
            <span className="text-base font-black text-emerald-400">
              +{myResult.pointsEarned}
            </span>
          </div>
        </div>
      )}

      {/* Live standings */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Round Scores
        </span>
        {[...results]
          .sort((a, b) => b.newScore - a.newScore)
          .map((result) => {
            const participant = participants.find((p) => p.id === result.participantId);
            const isSelf = result.participantId === currentUserId;

            return (
              <div
                key={result.participantId}
                className={`flex items-center gap-3 p-3 rounded-xl border-[2px] ${
                  isSelf ? "bg-primary/10 border-primary/30" : "bg-surface border-border"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border-[2px] ${
                    result.isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-rose-500/50 bg-rose-500/10"
                  }`}
                >
                  {result.isCorrect ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <XCircle size={14} className="text-rose-500" />
                  )}
                </div>
                <span className="text-xs font-black text-text-primary flex-1">
                  {isSelf ? "You" : participant?.name ?? "Opponent"}
                </span>
                {result.pointsEarned > 0 && (
                  <span className="text-xs font-black text-emerald-400">
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

      <p className="text-center text-xs text-text-secondary animate-pulse font-bold">
        Next question incoming…
      </p>
    </div>
  );
}
