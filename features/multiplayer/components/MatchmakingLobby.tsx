"use client";
// features/multiplayer/components/MatchmakingLobby.tsx

import React, { useEffect, useState } from "react";
import { Swords, X, Wifi, Clock } from "lucide-react";
import { Subject } from "@/features/curriculum/types";

interface MatchmakingLobbyProps {
  subject: Subject;
  onCancel: () => void;
}

function useElapsed(startTime: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return elapsed;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MatchmakingLobby({ subject, onCancel }: MatchmakingLobbyProps) {
  const [startTime] = useState(Date.now);
  const elapsed = useElapsed(startTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 py-10">
      {/* Animated arena icon */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings */}
        <span className="absolute inline-flex h-28 w-28 rounded-full bg-secondary/30 animate-ping" />
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-secondary/40 animate-ping [animation-delay:300ms]" />
        <div className="relative w-16 h-16 rounded-2xl bg-secondary border-[3px] border-border flex items-center justify-center shadow-[0_4px_0_rgba(20,24,39,0.9)]">
          <Swords size={30} className="text-text-primary" />
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Synchronous Arena
        </span>
        <h1 className="text-2xl font-black text-text-primary">
          Finding Your Opponent
        </h1>
        <p className="text-sm text-text-secondary font-medium max-w-xs">
          Searching for a{" "}
          <span className="text-text-primary font-black">{subject.name}</span>{" "}
          challenger. This usually takes under 30 seconds.
        </p>
      </div>

      {/* Elapsed timer */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)]">
        <Clock size={14} className="text-text-secondary" />
        <span className="text-sm font-black text-text-primary tabular-nums">
          {formatElapsed(elapsed)}
        </span>
        <Wifi size={14} className="text-primary animate-pulse" />
      </div>

      {/* Match facts */}
      <div className="w-full max-w-sm bg-surface-muted border-[2px] border-border rounded-2xl p-4 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between font-bold text-text-secondary">
          <span>Subject</span>
          <span className="text-text-primary">{subject.name}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-text-secondary">
          <span>Format</span>
          <span className="text-text-primary">1v1 Speed Rounds</span>
        </div>
        <div className="flex items-center justify-between font-bold text-text-secondary">
          <span>Time per question</span>
          <span className="text-text-primary">15 seconds</span>
        </div>
        <div className="flex items-center justify-between font-bold text-text-secondary">
          <span>Scoring</span>
          <span className="text-text-primary">Speed + Streak bonuses</span>
        </div>
      </div>

      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 px-5 py-2.5 bg-surface border-[2px] border-border rounded-xl text-xs font-black text-text-secondary hover:text-text-primary shadow-[0_2px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 transition-all cursor-pointer"
      >
        <X size={14} />
        CANCEL SEARCH
      </button>
    </div>
  );
}
