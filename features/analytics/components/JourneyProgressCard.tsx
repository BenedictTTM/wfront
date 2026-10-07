// features/analytics/components/JourneyProgressCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { JourneyProgressSummary } from "../types";

export interface JourneyProgressCardProps {
  journeyProgress?: JourneyProgressSummary | null;
  isLoading?: boolean;
}

export function JourneyProgressCard({
  journeyProgress,
  isLoading = false,
}: JourneyProgressCardProps) {
  // ── 1. LOADING STATE ──
  if (isLoading) {
    return <JourneyProgressSkeleton />;
  }

  // Fallback for missing/empty data
  if (!journeyProgress) {
    return (
      <div className="p-6 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-border flex items-center justify-center text-purple-600 shadow-[0_2px_0_#141827]">
          <Compass className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wide">
            Start Your Learning Journey
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Follow structured, step-by-step curriculum milestones and earn mastery stars as you level up.
          </p>
        </div>
        <Link
          href="/study"
          className="mt-1 px-4 py-2 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Explore Subjects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const {
    totalLevels = 0,
    completedLevels = 0,
    masteredLevels = 0,
    completionPercentage = 0,
    bySubject = [],
    nextRecommendedLevel,
  } = journeyProgress;

  const isCompletedAll = totalLevels > 0 && completedLevels >= totalLevels;

  return (
    <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-5">
      {/* ── 1. Header & Overall Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border-2 border-border flex items-center justify-center text-purple-600 shadow-[0_1px_0_#141827]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary">
              Curriculum Journey
            </h3>
            <p className="text-[11px] font-bold text-text-secondary">
              Milestones across active subjects
            </p>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="flex items-center gap-2 text-xs font-black text-text-secondary flex-wrap">
          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-border px-2.5 py-0.5 rounded-full shadow-[0_1px_0_#141827]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {completedLevels}/{totalLevels} Completed
          </span>
          <span className="flex items-center gap-1 text-purple-800 bg-purple-50 border border-border px-2.5 py-0.5 rounded-full shadow-[0_1px_0_#141827]">
            {completionPercentage}% Total
          </span>
          {masteredLevels > 0 && (
            <span className="flex items-center gap-1 text-amber-900 bg-amber-50 border border-border px-2.5 py-0.5 rounded-full shadow-[0_1px_0_#141827]">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {masteredLevels} Mastered
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Current Active Journey & Continue Action Box ── */}
      {nextRecommendedLevel ? (
        <div className="p-4 bg-purple-50/70 border-2 border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[0_2px_0_#141827]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-border flex items-center justify-center shrink-0 shadow-[0_1.5px_0_#141827]">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  Active Journey • {nextRecommendedLevel.subjectName}
                </span>
                {nextRecommendedLevel.subjectSlug && (
                  <Link
                    href={`/study/${encodeURIComponent(nextRecommendedLevel.subjectSlug)}`}
                    className="text-[10px] font-bold text-text-secondary hover:text-text-primary inline-flex items-center gap-0.5"
                    title="View full Journey Map"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
              <h4
                className="text-sm font-extrabold text-text-primary truncate"
                title={nextRecommendedLevel.title}
              >
                {nextRecommendedLevel.title}
              </h4>
            </div>
          </div>

          <Link
            href={nextRecommendedLevel.actionUrl}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer min-h-[40px]"
          >
            <span>Continue Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : isCompletedAll ? (
        <div className="p-4 bg-emerald-50/80 border-2 border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1.5px_0_#141827]">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase">All Journey Levels Completed!</h4>
              <p className="text-[11px] font-bold text-emerald-800">
                You have reached the end of the current curriculum. Practice weak topics or replay challenges for 3-star mastery.
              </p>
            </div>
          </div>
          <Link
            href="/study"
            className="px-4 py-2 bg-surface hover:bg-emerald-100 border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_1.5px_0_#141827] flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <span>Study Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* New user fallback when nextRecommendedLevel is null */
        <div className="p-4 bg-bg-secondary/60 border-2 border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1.5px_0_#141827]">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase text-text-primary">
                Ready to begin your learning path?
              </h4>
              <p className="text-[11px] font-bold text-text-secondary">
                Select a subject to take your first milestone challenge.
              </p>
            </div>
          </div>
          <Link
            href="/study"
            className="px-4 py-2 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <span>Start Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── 3. Compact Progress by Subject ── */}
      {bySubject.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t-2 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Progress By Subject
            </span>
            <span className="text-[10px] font-bold text-text-secondary">
              {bySubject.length} Subject{bySubject.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5">
            {bySubject.map((subject) => {
              const subjectTargetUrl = subject.subjectSlug
                ? `/study/${encodeURIComponent(subject.subjectSlug)}`
                : `/study`;

              return (
                <Link
                  key={subject.subjectId}
                  href={subjectTargetUrl}
                  title={`Open ${subject.subjectName} Journey Map`}
                  className="group flex flex-col gap-1.5 p-2 -mx-2 -my-1 rounded-xl hover:bg-bg-secondary/70 transition-all cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate min-w-0 flex items-baseline gap-1.5">
                      <span className="text-xs font-black text-text-primary truncate group-hover:text-purple-600 transition-colors">
                        {subject.subjectName}
                      </span>
                      <span className="text-[10px] font-bold text-text-secondary shrink-0">
                        ({subject.completedLevels}/{subject.totalLevels})
                      </span>
                    </div>
                    <span className="text-xs font-black text-text-primary shrink-0 ml-1">
                      {subject.percentage}%
                    </span>
                  </div>

                  {/* Compact Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-bg-secondary overflow-hidden">
                    <div
                      style={{ width: `${subject.percentage}%` }}
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JourneyProgressSkeleton() {
  return (
    <div className="p-5 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border" />
          <div className="flex flex-col gap-1.5">
            <div className="w-36 h-3 bg-bg-secondary rounded" />
            <div className="w-48 h-2.5 bg-bg-secondary rounded" />
          </div>
        </div>
        <div className="w-28 h-5 bg-bg-secondary rounded-full" />
      </div>

      <div className="h-16 bg-bg-secondary border-2 border-border rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <div className="w-28 h-3 bg-bg-secondary rounded" />
              <div className="w-8 h-3 bg-bg-secondary rounded" />
            </div>
            <div className="h-2 w-full bg-bg-secondary rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}


