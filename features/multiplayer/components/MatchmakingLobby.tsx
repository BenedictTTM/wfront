"use client";
// features/multiplayer/components/MatchmakingLobby.tsx

import React, { useEffect, useState } from "react";
import { Swords, X, Wifi, Clock } from "lucide-react";
import { Subject } from "@/features/curriculum/types";

interface MatchmakingLobbyProps {
  subject: Subject;
  waitingSince?: string;
  onCancel: () => void;
  isCancelling?: boolean;
}

function useServerElapsed(waitingSince?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!waitingSince) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [waitingSince]);

  if (!waitingSince) return 0;
  const start = new Date(waitingSince).getTime();
  if (isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / 1000));
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MatchmakingLobby({
  subject,
  waitingSince,
  onCancel,
  isCancelling = false,
}: MatchmakingLobbyProps) {
  const elapsed = useServerElapsed(waitingSince);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 py-8 max-w-lg mx-auto w-full animate-in fade-in duration-200">
      {/* Animated arena icon */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings */}
        <span className="absolute inline-flex h-28 w-28 rounded-full bg-secondary/30 animate-ping" />
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-secondary/40 animate-ping [animation-delay:300ms]" />
        <div className="relative w-16 h-16 rounded-2xl bg-secondary border-[3px] border-border flex items-center justify-center shadow-[0_4px_0_rgba(20,24,39,0.9)]">
          <Swords size={30} className="text-text-primary stroke-[2.5]" />
        </div>
      </div>

      {/* Matchmaking Status Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-surface-muted px-3 py-1 border-[1.5px] border-border rounded-full shadow-[0_1.5px_0_#141827]">
          Live Matchmaking
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Finding an Opponent
        </h1>
        <div className="px-4 py-1.5 bg-primary/20 border-[2px] border-border rounded-xl">
          <span className="text-sm font-black text-text-primary">{subject.name}</span>
        </div>
        <p className="text-xs text-text-secondary font-bold mt-1">
          Searching for a player...
        </p>
      </div>

      {/* Server-Driven Elapsed Timer */}
      <div className="flex items-center gap-2.5 px-5 py-2.5 bg-surface border-[2.5px] border-border rounded-2xl shadow-[0_3px_0_rgba(20,24,39,0.9)]">
        <Clock size={16} className="text-text-secondary stroke-[2.5]" />
        <span className="text-base font-black text-text-primary tabular-nums tracking-wider">
          {formatElapsed(elapsed)}
        </span>
        <Wifi size={14} className="text-emerald-500 animate-pulse stroke-[2.5]" />
      </div>

      {/* Match Rules Card */}
      <div className="w-full max-w-sm bg-surface border-[2.5px] border-border rounded-2xl p-4 flex flex-col gap-2.5 text-xs shadow-[0_3px_0_rgba(20,24,39,0.9)]">
        <div className="flex items-center justify-between font-bold border-b border-border/20 pb-2">
          <span className="text-text-secondary">Format</span>
          <span className="text-text-primary font-black">1v1 Speed Rounds</span>
        </div>
        <div className="flex items-center justify-between font-bold border-b border-border/20 pb-2">
          <span className="text-text-secondary">Time per question</span>
          <span className="text-text-primary font-black">15 seconds</span>
        </div>
        <div className="flex items-center justify-between font-bold">
          <span className="text-text-secondary">Scoring</span>
          <span className="text-text-primary font-black">Speed + Streak bonuses</span>
        </div>
      </div>

      {/* Cancel Search Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isCancelling}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border-[2.5px] border-border rounded-xl text-xs font-black text-text-secondary hover:text-text-primary shadow-[0_2.5px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
      >
        <X size={15} className="stroke-[3]" />
        <span>{isCancelling ? "CANCELING..." : "CANCEL"}</span>
      </button>
    </div>
  );
}
