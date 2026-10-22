// features/auth/components/profile/ProfileStatsGrid.tsx

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProfileStatsGridProps {
  displayStreak: number;
  longestStreak: number;
  quizzesCount: number;
  currentEnergy: number;
  maximumEnergy: number;
  energyPercent: number;
}

export function ProfileStatsGrid({
  displayStreak,
  longestStreak,
  quizzesCount,
  currentEnergy,
  maximumEnergy,
  energyPercent,
}: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
      {/* Active Streak Card */}
      <div className="p-3.5 sm:p-4 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col justify-between gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider">
            ACTIVE STREAK
          </span>
          <span className="text-base">🔥</span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {displayStreak} {displayStreak === 1 ? "Day" : "Days"}
          </div>
          <div className="text-xs font-bold text-text-secondary mt-0.5">
            Best record: {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      {/* Quizzes Completed Card */}
      <div className="p-3.5 sm:p-4 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col justify-between gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider">
            QUIZZES COMPLETED
          </span>
          <span className="text-base">⭐</span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
          </div>
          <div className="mt-2">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-border bg-primary/20 hover:bg-primary text-text-primary font-black text-xs transition-all shadow-[0_1.5px_0_#141827] active:translate-y-0.5"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Energy Card */}
      <div className="p-3.5 sm:p-4 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col justify-between gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider">
            DAILY ENERGY
          </span>
          <span className="text-base">⚡</span>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {currentEnergy} / {maximumEnergy}
            </div>
            <span className="text-xs font-black text-text-secondary">
              {Math.round(energyPercent)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-muted border-2 border-border rounded-full h-2 overflow-hidden my-1.5">
            <div
              className="h-full bg-primary border-r-2 border-border transition-all duration-500"
              style={{ width: `${energyPercent}%` }}
            />
          </div>

          <div className="text-xs font-bold text-text-secondary">
            Refills daily for test preparation
          </div>
        </div>
      </div>
    </div>
  );
}
