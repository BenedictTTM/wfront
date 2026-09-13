"use client";
// features/multiplayer/components/ParticipantRail.tsx

import React from "react";
import { Zap, Swords } from "lucide-react";
import { ParticipantState } from "../types";

interface ParticipantRailProps {
  participants: ParticipantState[];
  currentUserId: string;
  totalQuestions: number;
  currentQuestionIndex: number;
}

function ScoreBar({ participant, isSelf }: { participant: ParticipantState; isSelf: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border-[2px] flex-1 transition-all ${
        isSelf
          ? "bg-primary/10 border-primary/40"
          : "bg-surface-muted border-border"
      }`}
    >
      {/* Name */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            participant.isConnected ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary truncate max-w-[80px]">
          {isSelf ? "YOU" : participant.name}
        </span>
      </div>
      {/* Score */}
      <span className="text-xl font-black text-text-primary tabular-nums">
        {participant.score.toLocaleString()}
      </span>
      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">
        pts
      </span>
    </div>
  );
}

export function ParticipantRail({
  participants,
  currentUserId,
  totalQuestions,
  currentQuestionIndex,
}: ParticipantRailProps) {
  const me = participants.find((p) => p.id === currentUserId);
  const opponent = participants.find((p) => p.id !== currentUserId);

  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Score cards */}
      <div className="flex items-stretch gap-3">
        {me && <ScoreBar participant={me} isSelf />}

        {/* VS divider */}
        <div className="flex items-center justify-center px-1">
          <div className="w-8 h-8 rounded-lg bg-surface border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <Swords size={14} className="text-text-secondary" />
          </div>
        </div>

        {opponent && <ScoreBar participant={opponent} isSelf={false} />}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold text-text-secondary">
        <span className="flex items-center gap-1">
          <Zap size={10} /> Round {currentQuestionIndex + 1}
        </span>
        <span>{totalQuestions} questions total</span>
      </div>
    </div>
  );
}
