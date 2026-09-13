// features/curriculum/components/journey/JourneyProgress.tsx

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Crown, Play, Sparkles, Star, Zap } from "lucide-react";
import { JourneyLevelItem } from "../../types";

interface JourneyProgressProps {
  subjectName: string;
  subjectSlug: string;
  completedLevels: number;
  totalLevels: number;
  masteredLevels: number;
  completionPercentage: number;
  totalXpEarned: number;
  currentLevel: JourneyLevelItem | null;
  onContinueCurrent?: () => void;
}

export function JourneyProgress({
  subjectName,
  subjectSlug,
  completedLevels,
  totalLevels,
  masteredLevels,
  completionPercentage,
  totalXpEarned,
  currentLevel,
  onContinueCurrent,
}: JourneyProgressProps) {
  return (
    <header className="w-full bg-surface border-[3px] border-border rounded-3xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Top row: Subject Navigation & Stats Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[2px] border-border pb-3.5">
        <div className="flex items-center gap-2">
          <Link
            href="/study"
            className="flex items-center gap-1.5 px-3 py-1 bg-surface-muted hover:bg-border-muted/50 active:translate-y-0.5 border-[2px] border-border rounded-xl text-xs font-black text-text-primary transition-all cursor-pointer"
            aria-label="Back to Study Center"
          >
            <ArrowLeft size={14} />
            <span>Study Center</span>
          </Link>
          <span className="text-sm md:text-base font-black text-text-primary flex items-center gap-1.5 ml-1">
            <BookOpen size={16} />
            {subjectName} Journey
          </span>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-2">
          {/* Total Stars Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border-[2px] border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827]">
            <Star size={14} className="fill-amber-400 text-border" />
            <span>{masteredLevels * 3 + (completedLevels - masteredLevels)} Stars</span>
          </div>

          {/* Total Journey XP Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/40 border-[2px] border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827]">
            <Zap size={14} className="fill-primary text-border" />
            <span>{totalXpEarned} XP Earned</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Summary */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-black text-text-primary">
          <span className="uppercase tracking-wider text-text-secondary text-[11px]">
            Overall Journey Progression
          </span>
          <span>
            {completedLevels} of {totalLevels} Levels Completed ({completionPercentage}%)
          </span>
        </div>

        <div
          className="w-full h-3.5 border-[2.5px] border-border rounded-full bg-surface-muted overflow-hidden relative shadow-inner"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${subjectName} journey progress`}
        >
          <div
            className="h-full bg-primary border-r-[2px] border-border transition-all duration-700 ease-out"
            style={{ width: `${Math.max(5, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* Quick Continue Action Banner */}
      {currentLevel && onContinueCurrent && (
        <div className="mt-1 p-3.5 bg-primary/25 border-[2px] border-border rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shrink-0 shadow-[0_2px_0_#141827]">
              <Play size={14} className="fill-text-primary text-text-primary ml-0.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                Next Recommended Step
              </span>
              <span className="text-xs md:text-sm font-black text-text-primary truncate">
                {currentLevel.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinueCurrent}
            className="px-4 py-2 bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#141827] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Continue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </header>
  );
}
