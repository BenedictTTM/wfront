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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* Active Streak Card */}
      <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
            ACTIVE STREAK
          </span>
          <span className="text-lg">🔥</span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {displayStreak} {displayStreak === 1 ? "Day" : "Days"}
          </div>
          <div className="text-xs font-bold text-text-secondary mt-1">
            Best record: {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      {/* Quizzes Completed Card */}
      <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
            QUIZZES COMPLETED
          </span>
          <span className="text-lg">⭐</span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
          </div>
          <div className="mt-2.5">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-border bg-primary/20 hover:bg-primary text-text-primary font-black text-xs transition-all shadow-[0_2px_0_#141827] active:translate-y-0.5"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Energy Card */}
      <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
            DAILY ENERGY
          </span>
          <span className="text-lg">⚡</span>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {currentEnergy} / {maximumEnergy}
            </div>
            <span className="text-xs font-black text-text-secondary">
              {Math.round(energyPercent)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-muted border-2 border-border rounded-full h-3 overflow-hidden my-2">
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
