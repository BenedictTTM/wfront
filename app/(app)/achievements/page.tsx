"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Shield, UserPlus } from "lucide-react";
import { useAchievements } from "@/features/gamification/hooks";
import type { AchievementCategory } from "@/features/gamification/constants";
import {
  AchievementCard,
  AchievementProgressBanner,
} from "@/features/gamification/components";
import { PageHeader } from "@/components/shared";

const CATEGORIES: AchievementCategory[] = [
  "All",
  "Quizzes",
  "Streaks",
  "Mastery",
  "Multiplayer",
];

export default function AchievementsPage() {
  const {
    items,
    unlockedCount,
    totalCount,
    handleClaim,
    isLoading,
    isGuest,
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>("All");

  // Metrics
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Next reward milestone
  const nextTarget = 3;
  const remainingForNext = Math.max(0, nextTarget - unlockedCount);

  // Unlocked / Completed Honor Badges & Crests
  const unlockedCrestsCount = useMemo(
    () =>
      items.filter(
        (a) =>
          a.crestUnlocked ||
          a.completed ||
          a.status === "UNLOCKED" ||
          (a.currentTier && a.currentTier >= 3 && (a.remaining === 0 || a.currentCount >= a.targetCount)) ||
          (a.tiers && a.tiers.find((t) => t.tier === 3)?.completed)
      ).length,
    [items]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: items.length,
      Quizzes: items.filter((a) => a.category === "Quizzes").length,
      Streaks: items.filter((a) => a.category === "Streaks").length,
      Mastery: items.filter((a) => a.category === "Mastery").length,
      Multiplayer: items.filter((a) => a.category === "Multiplayer").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((a) => a.category === selectedCategory);
  }, [items, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-1 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
          <div className="h-8 w-28 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
        </div>
        <div className="border-2 border-border bg-surface rounded-xl p-3.5 shadow-offset h-24 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 border-2 border-border bg-surface rounded-xl shadow-offset h-28 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3.5 py-1 pb-24 sm:pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      {/* ── Page Header ── */}
      <PageHeader
        compactOnMobile
        title={
          <>
            <span className="sm:hidden">Achievements</span>
            <span className="hidden sm:inline">Achievements & Trophies</span>
          </>
        }
        description={
          <>
            <span className="sm:hidden">Unlock milestones & prestige crests.</span>
            <span className="hidden sm:inline">
              Unlock academic milestones, earn bonus XP, and collect prestige crests.
            </span>
          </>
        }
        actions={
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border-2 shadow-[0_1.5px_0_#141827] text-[10px] sm:text-xs font-black transition-all ${
              unlockedCrestsCount > 0
                ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                : "border-neutral-900 bg-white text-neutral-900"
            }`}
          >
            <Shield className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${unlockedCrestsCount > 0 ? "text-emerald-700" : "text-neutral-700"} shrink-0`} />
            <span className="whitespace-nowrap">
              <span className="sm:hidden">
                {unlockedCrestsCount}/{items.length} Badges
              </span>
              <span className="hidden sm:inline">
                Honor Badges: {unlockedCrestsCount}/{items.length} Completed ({unlockedCrestsCount} Earned)
              </span>
            </span>
          </div>
        }
      />

      {/* ── Guest Session Notice ── */}
      {isGuest && (
        <div className="border-2 border-border bg-amber-500/10 rounded-xl p-3 sm:p-3.5 shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400 border-2 border-border mt-0.5 shadow-[0_1.5px_0_#141827] shrink-0">
              <UserPlus className="w-4 h-4 text-text-primary" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-text-primary">
                Guest Achievements Mode
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-text-secondary mt-0.5">
                Milestones unlocked during this session are saved locally. Register to preserve your permanent trophy showcase.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="w-full md:w-auto px-3 py-1.5 rounded-lg border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs text-center transition-all shadow-[0_1.5px_0_#141827] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            Create Permanent Account
          </Link>
        </div>
      )}

      {/* ── SUMMARY & REWARD MILESTONE HERO ── */}
      <AchievementProgressBanner
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
        remainingForNext={remainingForNext}
        nextTarget={nextTarget}
      />

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#FFF9DE] text-text-primary border-2 border-border shadow-[0_2px_0_#141827]"
                  : "bg-surface text-text-secondary hover:text-text-primary border-2 border-border hover:bg-surface-muted shadow-[0_1.5px_0_#141827] active:translate-y-0.5"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  isSelected
                    ? "bg-[#FDECA8] border-border text-text-primary font-black"
                    : "bg-surface-muted border-border/40 text-text-secondary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ACHIEVEMENTS GRID (Compact 2-Column Neo-Brutalist Layout) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredItems.map((item) => (
          <AchievementCard key={item.id} item={item} onClaim={handleClaim} />
        ))}
      </div>
    </div>
  );
}
