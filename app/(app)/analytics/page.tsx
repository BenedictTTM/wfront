"use client";

import React, { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import type { AnalyticsPeriod } from "@/features/analytics/types";
import {
  PerformanceSnapshotCard,
  SubjectPerformanceCard,
  LearningProfileCard,
  TopicMasteryBreakdownCard,
  JourneyProgressCard,
  MultiplayerCard,
  AnalyticsEmptyState,
  AnalyticsSkeleton,
} from "@/features/analytics/components";

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

export default function AnalyticsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnalyticsOverview(selectedSubjectId ?? undefined, period);

  return (
    <div className="flex flex-col gap-8 py-4 w-full max-w-5xl mx-auto px-2 sm:px-4">
      {/* ── Page Header & Period Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2.5 border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight">
            ANALYTICS
          </h1>
          <p className="text-xs sm:text-sm font-bold text-text-secondary mt-1">
            See how your learning is improving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Accessible Period Selector Tabs */}
          <div
            role="tablist"
            aria-label="Select analytics period"
            className="inline-flex items-center p-1 bg-bg-secondary border-2 border-border rounded-xl shadow-[0_2px_0_#141827]"
          >
            {PERIOD_OPTIONS.map((item) => {
              const isSelected = period === item.value;
              return (
                <button
                  key={item.value}
                  role="tab"
                  id={`period-tab-${item.value}`}
                  aria-selected={isSelected}
                  aria-controls="analytics-content"
                  onClick={() => setPeriod(item.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-text-primary font-black border-2 border-border shadow-[0_2px_0_#141827]"
                      : "text-text-secondary hover:text-text-primary font-bold border-2 border-transparent"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh analytics data"
            className="p-2 bg-surface hover:bg-bg-secondary border-2 border-border rounded-xl text-text-secondary hover:text-text-primary shadow-[0_2px_0_#141827] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 1. LOADING STATE ── */}
      {isLoading && <AnalyticsSkeleton />}

      {/* ── 2. ERROR STATE ── */}
      {isError && !isLoading && (
        <div className="p-6 bg-rose-50 border-2.5 border-rose-300 rounded-2xl shadow-[0_4px_0_#141827] flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <h2 className="text-base font-extrabold text-rose-900">
            Failed to load learning insights
          </h2>
          <p className="text-xs text-rose-700 max-w-md">
            {error instanceof Error ? error.message : "An unexpected error occurred while loading analytics data."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-[0_2px_0_#141827] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── 3. POPULATED OR EMPTY STATE ── */}
      {data && !isLoading && (
        <div id="analytics-content" role="tabpanel" aria-labelledby={`period-tab-${period}`}>
          {data.snapshot.quizzesCompleted === 0 && data.snapshot.questionsCompleted === 0 ? (
            <AnalyticsEmptyState />
          ) : (
            <div className="flex flex-col gap-7 sm:gap-8">
              {/* 1. PERFORMANCE SNAPSHOT (Accuracy, Mastery, Questions, Time) */}
              <section aria-labelledby="heading-snapshot" className="flex flex-col gap-2.5">
                <h2 id="heading-snapshot" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  PERFORMANCE SNAPSHOT
                </h2>
                <PerformanceSnapshotCard snapshot={data.snapshot} insights={data.insights} />
              </section>

              {/* 3. YOUR LEARNING PROFILE (Weak Areas Needing Attention & Strongest Topics) */}
              <section aria-labelledby="heading-learning-profile" className="flex flex-col gap-2.5">
                <h2 id="heading-learning-profile" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  YOUR LEARNING PROFILE
                </h2>
                <LearningProfileCard
                  strengths={data.strengths}
                  weaknesses={data.weaknesses}
                />
              </section>

              {/* 4. SUBJECT PERFORMANCE */}
              <section aria-labelledby="heading-subjects" className="flex flex-col gap-2.5">
                <h2 id="heading-subjects" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  SUBJECT PERFORMANCE
                </h2>
                <SubjectPerformanceCard
                  subjects={data.subjects}
                  selectedSubjectId={selectedSubjectId}
                  onSelectSubject={setSelectedSubjectId}
                  isPro={data.entitlementActive}
                />
              </section>

              {/* 5. TOPIC MASTERY */}
              <section aria-labelledby="heading-mastery" className="flex flex-col gap-2.5">
                <h2 id="heading-mastery" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  TOPIC MASTERY
                </h2>
                <TopicMasteryBreakdownCard mastery={data.topicMastery} />
              </section>

              {/* 6. JOURNEY PROGRESS (Next Action & Milestone Completion) */}
              <section aria-labelledby="heading-journey" className="flex flex-col gap-2.5">
                <h2 id="heading-journey" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  JOURNEY PROGRESS
                </h2>
                <JourneyProgressCard journeyProgress={data.journeyProgress} />
              </section>


              {/* 8. MULTIPLAYER STATISTICS (Rendered only when meaningful competitive data exists) */}
              {data.multiplayer && (data.multiplayer.matchesPlayed ?? 0) > 0 && (
                <section aria-labelledby="heading-multiplayer" className="flex flex-col gap-2.5">
                  <h2 id="heading-multiplayer" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                    MULTIPLAYER STATISTICS
                  </h2>
                  <MultiplayerCard stats={data.multiplayer} />
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
