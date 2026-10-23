"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, Timer, ArrowRight } from "lucide-react";

export interface ForfeitCountdownBannerProps {
  isCurrentUserDisconnected: boolean;
  remainingSeconds: number;
  totalSeconds?: number;
  matchId?: string | null;
  showReturnButton?: boolean;
}

export function ForfeitCountdownBanner({
  isCurrentUserDisconnected,
  remainingSeconds,
  totalSeconds = 30,
  matchId,
  showReturnButton = false,
}: ForfeitCountdownBannerProps) {
  const isUrgent = remainingSeconds <= 10;
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-3 duration-300">
      <div
        className={`relative overflow-hidden rounded-2xl border-[2.5px] p-4 transition-all duration-300 ${
          isUrgent
            ? "bg-[#FEF2F2] dark:bg-[#451A1A] border-red-600 shadow-[0_4px_0_#DC2626]"
            : "bg-amber-50 dark:bg-[#38260D] border-amber-500 shadow-[0_4px_0_#D97706]"
        }`}
      >
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left status badge & details */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-[2px] ${
                isUrgent
                  ? "bg-red-500/15 border-red-500 text-red-600 dark:text-red-400"
                  : "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
              }`}
            >
              <WifiOff
                size={20}
                className={isUrgent ? "animate-pulse" : ""}
                strokeWidth={2.5}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isUrgent
                      ? "text-red-700 dark:text-red-300"
                      : "text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {isCurrentUserDisconnected ? "Connection Disrupted" : "Opponent Disconnected"}
                </span>
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isUrgent ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isUrgent ? "bg-red-600" : "bg-amber-600"
                    }`}
                  />
                </span>
              </div>
              <p className="text-xs font-bold text-text-primary truncate">
                {isCurrentUserDisconnected
                  ? "Reconnecting to duel... Forfeit in"
                  : "Waiting for player to return... Forfeit in"}
              </p>
            </div>
          </div>

          {/* Right: Live Ticking Countdown Pill & Action */}
          <div className="flex items-center gap-2 shrink-0">
            {showReturnButton && matchId && (
              <Link
                href={`/study/multiplayer/${matchId}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] border-border bg-primary text-text-primary hover:bg-[#ebd060] font-black text-xs uppercase tracking-wider shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Return to Duel</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] font-black text-sm tabular-nums tracking-wider shadow-[0_2px_0_rgba(20,24,39,0.2)] ${
                isUrgent
                  ? "bg-red-600 border-red-800 text-white animate-bounce-short"
                  : "bg-amber-500 border-amber-700 text-black"
              }`}
            >
              <Timer size={14} className={isUrgent ? "animate-spin" : ""} />
              <span>00:{String(remainingSeconds).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* Mobile-only full width return button */}
        {showReturnButton && matchId && (
          <div className="mt-2.5 sm:hidden">
            <Link
              href={`/study/multiplayer/${matchId}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border-[2px] border-border bg-primary text-text-primary hover:bg-[#ebd060] font-black text-xs uppercase tracking-wider shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Return to Duel</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isUrgent ? "bg-red-600 dark:bg-red-400" : "bg-amber-500 dark:bg-amber-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
