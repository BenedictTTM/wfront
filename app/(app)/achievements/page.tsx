"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Award, UserPlus } from "lucide-react";
import { useAchievements } from "@/features/gamification/hooks";
import type { AchievementCategory } from "@/features/gamification/constants";
import {
  AchievementCard,
  AchievementProgressBanner,
  BadgesModal,
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
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Metrics
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Next reward milestone
  const nextTarget = 3;
  const remainingForNext = Math.max(0, nextTarget - unlockedCount);

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
      <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
          <div className="h-10 w-28 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
        </div>
        <div className="border-2.5 border-border bg-surface rounded-2xl p-6 shadow-offset h-36 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      {/* ── Page Header ── */}
      <PageHeader
        title="Achievements & Trophies"
        description="Unlock academic milestones, earn bonus XP, and collect prestige badges"
        actions={
          <button
            type="button"
            onClick={() => setIsBadgesModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border-2.5 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-text-primary" />
            <span>Honor Badges</span>
          </button>
        }
      />

      {/* ── Guest Session Notice ── */}
      {isGuest && (
        <div className="border-2.5 border-border bg-amber-500/10 rounded-2xl p-4 sm:p-5 shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 border-2 border-border mt-0.5 shadow-[0_2px_0_#141827] shrink-0">
              <UserPlus className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">
                Guest Achievements Mode
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-0.5">
                Milestones unlocked during this session are saved locally. Register to preserve your permanent trophy showcase.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs text-center transition-all shadow-[0_2px_0_#141827] active:translate-y-0.5 whitespace-nowrap shrink-0"
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
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-primary text-text-primary border-2 border-border shadow-[0_2.5px_0_#141827]"
                  : "bg-surface text-text-secondary hover:text-text-primary border-2 border-border hover:bg-surface-muted shadow-[0_2px_0_#141827] active:translate-y-0.5"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                  isSelected
                    ? "bg-surface border-border text-text-primary"
                    : "bg-surface-muted border-border/40 text-text-secondary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ACHIEVEMENTS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredItems.map((item) => (
          <AchievementCard key={item.id} item={item} onClaim={handleClaim} />
        ))}
      </div>

      {/* ── HONOR BADGES MODAL ── */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />
    </div>
  );
}
