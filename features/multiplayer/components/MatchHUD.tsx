"use client";
// features/multiplayer/components/MatchHUD.tsx

import React, { useMemo } from "react";
import { Flame, Check } from "lucide-react";

export interface MatchHUDProps {
  player: {
    gamerTag: string;
    avatarUrl: string;
    score: number;
    streak: number;
  };
  opponent: {
    gamerTag: string;
    avatarUrl: string;
    score: number;
    streak: number;
    status: "THINKING" | "LOCKED_IN";
  };
  currentRound: number; // 1 to 10
  totalRounds?: number; // default 10
  remainingTimeMs: number; // 0 to 15000
  maxScoreDifferential?: number; // default 500 for normalisation
}

/**
 * Consolidated 3-Column Top HUD (Sticky Header)
 * Reorganizes top bar into a balanced 3-column sticky header:
 * - Left: User avatar circle, gamer tag, neutral bold score (white/slate-900)
 * - Center: Anchored countdown timer and 6px Tug-of-War balance track with centered marker
 * - Right: Opponent live status badge, neutral bold score, opponent tag, avatar circle
 */
export const MatchHUD = React.memo(function MatchHUD({
  player,
  opponent,
  currentRound: _currentRound,
  totalRounds: _totalRounds = 10,
  remainingTimeMs,
  maxScoreDifferential = 500,
}: MatchHUDProps) {
  // ── Tug-of-War Momentum Formula ──────────────────────────────────────────
  const maxDiff = maxScoreDifferential > 0 ? maxScoreDifferential : 500;
  const rawOffset = ((player.score - opponent.score) / maxDiff) * 50;
  const indicatorPosition = Math.min(Math.max(50 + rawOffset, 10), 90);

  // ── Timer Display & Alert Thresholds ─────────────────────────────────────
  const clampedTimeMs = Math.max(0, remainingTimeMs);
  const countdownText = `${(clampedTimeMs / 1000).toFixed(0)}s`;
  const seconds = Math.round(clampedTimeMs / 1000);

  const { timerTextColor, timerBorderColor, timerBgColor, timerPulseClass } = useMemo(() => {
    if (seconds <= 3) {
      return {
        timerTextColor: "text-rose-700",
        timerBorderColor: "border-rose-600",
        timerBgColor: "bg-rose-100",
        timerPulseClass: "animate-pulse",
      };
    }
    if (seconds <= 7) {
      return {
        timerTextColor: "text-text-primary",
        timerBorderColor: "border-border",
        timerBgColor: "bg-primary",
        timerPulseClass: "",
      };
    }
    return {
      timerTextColor: "text-text-primary",
      timerBorderColor: "border-border",
      timerBgColor: "bg-surface-muted",
      timerPulseClass: "",
    };
  }, [seconds]);

  const playerInitial = (player.gamerTag || "P").trim().charAt(0).toUpperCase();
  const opponentInitial = (opponent.gamerTag || "O").trim().charAt(0).toUpperCase();

  return (
    <header
      role="region"
      aria-label="Multiplayer Match HUD"
      className="sticky top-0 z-30 w-full bg-surface border-[2.5px] border-border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-[0_4px_0_#141827] select-none"
    >
      <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* ── LEFT COLUMN: User (Avatar Circle, Gamer Tag, Streak, Score) ── */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 justify-start">
          {/* Avatar Circle */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2px] border-border bg-secondary flex items-center justify-center font-black text-xs text-text-primary overflow-hidden shrink-0 shadow-[0_1px_0_#141827]">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.gamerTag}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{playerInitial}</span>
            )}
          </div>

          {/* Gamer Tag & Streak */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-xs sm:text-sm font-black text-text-primary truncate max-w-[60px] sm:max-w-[100px]"
              title={player.gamerTag}
            >
              {player.gamerTag}
            </span>
            {player.streak >= 2 && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary border-[1.5px] border-border text-text-primary text-[10px] font-black shrink-0 shadow-[0_1px_0_#141827]"
                title={`${player.streak} streak`}
              >
                <Flame size={10} className="text-text-primary fill-text-primary shrink-0" />
                <span>{player.streak}</span>
              </span>
            )}
          </div>

          {/* Neutral Bold Score */}
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-sm sm:text-base font-black tabular-nums text-text-primary shrink-0 ml-0.5"
            title="Your score"
          >
            {player.score.toLocaleString()}
          </span>
        </div>

        {/* ── CENTER COLUMN: Match Dynamics (Anchored Timer & Tug-of-War Track) ── */}
        <div className="flex flex-col items-center justify-center w-[130px] sm:w-[200px] md:w-[240px] px-1 sm:px-2 min-w-0">
          {/* Countdown Timer */}
          <div
            className={`px-2.5 py-0.5 rounded-full border-[1.5px] text-[11px] sm:text-xs font-mono font-black flex items-center justify-center transition-colors mb-1 shadow-[0_1px_0_#141827] ${timerTextColor} ${timerBorderColor} ${timerBgColor} ${timerPulseClass}`}
            title={`Remaining Time: ${countdownText}`}
          >
            <span>{countdownText}</span>
          </div>

          {/* Tug-of-War Balance Track with Centered Relative Gap Marker */}
          <div className="w-full relative flex items-center h-2">
            {/* Clean neutral track */}
            <div className="h-2 w-full rounded-full bg-surface-muted border-[1.5px] border-border overflow-hidden relative flex">
              <div className="w-1/2 h-full bg-secondary/50 border-r border-border/30" />
              <div className="w-1/2 h-full bg-surface-muted" />
            </div>

            {/* Marker representing relative score gap */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-[2px] border-border shadow-[0_1.5px_0_#141827] z-10 pointer-events-none transition-all duration-300 ease-out flex items-center justify-center"
              style={{ left: `${indicatorPosition}%` }}
              aria-label={`Momentum position ${indicatorPosition}%`}
            >
              <div className="w-1 h-1 rounded-full bg-border" />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Opponent (Live Status, Neutral Bold Score, Tag, Avatar Circle) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 justify-end">
          {/* Opponent Live Status Badge */}
          {opponent.status === "LOCKED_IN" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border-[1.5px] border-border text-emerald-900 text-[10px] font-black shrink-0 shadow-[0_1px_0_#141827] tracking-tight">
              <Check size={10} className="stroke-[3.5] text-emerald-800 shrink-0" />
              <span className="hidden sm:inline">Locked In</span>
              <span className="sm:hidden">Locked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted border-[1.5px] border-border text-text-secondary text-[10px] font-black shrink-0 shadow-[0_1px_0_#141827]">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-pulse shrink-0" />
              <span className="hidden sm:inline">Thinking...</span>
              <span className="sm:hidden">Thinking</span>
            </span>
          )}

          {/* Opponent Neutral Bold Score */}
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-sm sm:text-base font-black tabular-nums text-text-primary shrink-0"
            title="Opponent score"
          >
            {opponent.score.toLocaleString()}
          </span>

          {/* Opponent Tag */}
          <span
            className="text-xs sm:text-sm font-black text-text-primary truncate max-w-[60px] sm:max-w-[100px] text-right"
            title={opponent.gamerTag}
          >
            {opponent.gamerTag}
          </span>

          {/* Opponent Avatar Circle */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2px] border-border bg-primary flex items-center justify-center font-black text-xs text-text-primary overflow-hidden shrink-0 shadow-[0_1px_0_#141827]">
            {opponent.avatarUrl ? (
              <img
                src={opponent.avatarUrl}
                alt={opponent.gamerTag}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{opponentInitial}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
