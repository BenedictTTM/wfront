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
    <div className="border-2.5 border-border bg-surface rounded-2xl p-5 sm:p-6 shadow-offset flex flex-col sm:flex-row items-start sm:items-center gap-5">
      {/* Trophy icon */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/40 border-2.5 border-border flex items-center justify-center text-2xl sm:text-3xl shadow-[0_3px_0_#141827] shrink-0 select-none">
        🏆
      </div>

      {/* Hero Progress Details */}
      <div className="flex flex-col gap-2.5 flex-1 w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-xs sm:text-sm font-black text-text-primary uppercase tracking-wider">
            TOTAL PROGRESS: {unlockedCount} OF {totalCount} UNLOCKED
          </h2>
          <span className="text-xs sm:text-sm font-black text-text-primary tabular-nums">
            {progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-muted border-2.5 border-border rounded-full h-3.5 sm:h-4 overflow-hidden relative">
          <div
            className="h-full bg-primary border-r-2 border-border transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Next reward milestone */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-primary">
          <span className="text-base">🎁</span>
          {remainingForNext > 0 ? (
            <span>
              <strong className="font-black">Next Milestone:</strong> +500 Gems at {nextTarget} Unlocked{" "}
              <span className="text-text-secondary font-bold">
                ({remainingForNext} remaining)
              </span>
            </span>
          ) : (
            <span>
              <strong className="font-black">Milestone Achieved!</strong> Keep unlocking to earn elite rankings.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
