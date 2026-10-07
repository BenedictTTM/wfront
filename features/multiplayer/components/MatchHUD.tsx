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
        timerTextColor: "text-rose-400",
        timerBorderColor: "border-rose-500",
        timerBgColor: "bg-rose-500/20",
        timerPulseClass: "animate-pulse",
      };
    }
    if (seconds <= 7) {
      return {
        timerTextColor: "text-amber-400",
        timerBorderColor: "border-amber-400/80",
        timerBgColor: "bg-amber-400/15",
        timerPulseClass: "",
      };
    }
    return {
      timerTextColor: "text-slate-200",
      timerBorderColor: "border-slate-700",
      timerBgColor: "bg-slate-800/80",
      timerPulseClass: "",
    };
  }, [seconds]);

  const playerInitial = (player.gamerTag || "P").trim().charAt(0).toUpperCase();
  const opponentInitial = (opponent.gamerTag || "O").trim().charAt(0).toUpperCase();

  return (
    <header
      role="region"
      aria-label="Multiplayer Match HUD"
      className="sticky top-0 z-30 w-full h-16 max-h-16 bg-[#0F172A] border border-slate-800 rounded-xl px-2.5 sm:px-4 shadow-lg select-none"
    >
      <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* ── LEFT COLUMN: User (Avatar Circle, Gamer Tag, Streak, Neutral Bold Score) ── */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 justify-start">
          {/* Avatar Circle */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 overflow-hidden shrink-0 shadow-sm">
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
              className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[60px] sm:max-w-[100px]"
              title={player.gamerTag}
            >
              {player.gamerTag}
            </span>
            {player.streak >= 2 && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black shrink-0"
                title={`${player.streak} streak`}
              >
                <Flame size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                <span>{player.streak}</span>
              </span>
            )}
          </div>

          {/* Neutral Bold Score (White / Neutral — Never misleading green while trailing) */}
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-sm sm:text-base font-black tabular-nums text-white shrink-0 ml-0.5"
            title="Your score"
          >
            {player.score.toLocaleString()}
          </span>
        </div>

        {/* ── CENTER COLUMN: Match Dynamics (Anchored Timer & Tug-of-War Track) ── */}
        <div className="flex flex-col items-center justify-center w-[130px] sm:w-[200px] md:w-[240px] px-1 sm:px-2 min-w-0">
          {/* Countdown Timer (Positioned cleanly directly above the balance bar) */}
          <div
            className={`px-2 py-0.5 rounded-md border text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center transition-colors mb-1 ${timerTextColor} ${timerBorderColor} ${timerBgColor} ${timerPulseClass}`}
            title={`Remaining Time: ${countdownText}`}
          >
            <span>{countdownText}</span>
          </div>

          {/* 6px Horizontal Tug-of-War Balance Track with Centered Relative Gap Marker */}
          <div className="w-full relative flex items-center h-[6px]">
            {/* Gradient Track: Red/Rose (Opponent Advantage) vs Green/Emerald (Player Advantage) */}
            <div className="h-[6px] w-full rounded-full bg-gradient-to-r from-rose-500 via-slate-700 to-emerald-500 shadow-inner" />

            {/* Centered Spring Marker representing relative score gap */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow-[0_0_8px_rgba(255,255,255,0.9)] z-10 pointer-events-none transition-all duration-300 ease-out"
              style={{ left: `${indicatorPosition}%` }}
              aria-label={`Momentum position ${indicatorPosition}%`}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Opponent (Live Status, Neutral Bold Score, Tag, Avatar Circle) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 justify-end">
          {/* Opponent Live Status Badge */}
          {opponent.status === "LOCKED_IN" ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-black shrink-0 tracking-tight">
              <Check size={10} className="stroke-[3.5] text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Locked In</span>
              <span className="sm:hidden">Locked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Thinking...</span>
              <span className="sm:hidden">Thinking</span>
            </span>
          )}

          {/* Opponent Neutral Bold Score */}
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-sm sm:text-base font-black tabular-nums text-white shrink-0"
            title="Opponent score"
          >
            {opponent.score.toLocaleString()}
          </span>

          {/* Opponent Tag */}
          <span
            className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[60px] sm:max-w-[100px] text-right"
            title={opponent.gamerTag}
          >
            {opponent.gamerTag}
          </span>

          {/* Opponent Avatar Circle */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 overflow-hidden shrink-0 shadow-sm">
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
