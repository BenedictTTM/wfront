// features/gamification/components/AchievementProgressBanner.tsx

"use client";

import React from "react";

interface AchievementProgressBannerProps {
  unlockedCount: number;
  totalCount: number;
  progressPercent: number;
  remainingForNext: number;
  nextTarget: number;
}

export function AchievementProgressBanner({
  unlockedCount,
  totalCount,
  progressPercent,
  remainingForNext,
  nextTarget,
}: AchievementProgressBannerProps) {
  return (
    <div className="border-2 sm:border-2.5 border-border bg-surface rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-[0_2px_0_#141827] sm:shadow-offset flex flex-row items-center gap-2 sm:gap-3">
      {/* Trophy icon */}
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/40 border-2 border-border flex items-center justify-center text-sm sm:text-lg shadow-[0_1.5px_0_#141827] shrink-0 select-none">
        🏆
      </div>

      {/* Hero Progress Details */}
      <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 w-full min-w-0">
        <div className="flex items-center justify-between gap-1.5 whitespace-nowrap">
          <h2 className="text-[10px] sm:text-[11px] font-black text-text-primary uppercase tracking-wide truncate">
            <span className="sm:hidden">Progress: {unlockedCount}/{totalCount} Unlocked</span>
            <span className="hidden sm:inline">TOTAL PROGRESS: {unlockedCount} OF {totalCount} UNLOCKED</span>
          </h2>
          <span className="text-xs sm:text-sm font-black text-text-primary tabular-nums shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-muted border-[1.5px] sm:border-2 border-border rounded-full h-1.5 sm:h-2 overflow-hidden relative">
          <div
            className="h-full bg-primary border-r-2 border-border transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Next reward milestone — Strictly Single line on mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-text-primary whitespace-nowrap overflow-hidden">
          <span className="text-xs shrink-0">🎁</span>
          {remainingForNext > 0 ? (
            <span className="truncate">
              <span className="sm:hidden">
                <strong className="font-black">Next:</strong> +500 💎 at {nextTarget} ({remainingForNext} left)
              </span>
              <span className="hidden sm:inline">
                <strong className="font-black">Next Milestone:</strong> +500 Gems at {nextTarget} Unlocked{" "}
                <span className="text-text-secondary font-bold">({remainingForNext} remaining)</span>
              </span>
            </span>
          ) : (
            <span className="truncate">
              <strong className="font-black text-emerald-700">Milestone Achieved!</strong> Keep unlocking to earn elite rankings.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
