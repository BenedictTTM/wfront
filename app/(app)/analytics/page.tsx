
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  Sparkles,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";
import { useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import type { AnalyticsPeriod } from "@/features/analytics/types";
import {
  PerformanceSnapshotCard,
  PerformanceTrendCard,
  SubjectPerformanceCard,
  LearningProfileCard,
  TopicMasteryBreakdownCard,
  JourneyProgressCard,
  MultiplayerCard,
  AnalyticsEmptyState,
  AnalyticsCalculatingState,
  AnalyticsSkeleton,
} from "@/features/analytics/components";

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

export default function AnalyticsPage() {
  const { data: me, isLoading: isLoadingAuth, isPending: isPendingAuth } = useMe();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  // Auth is resolving during SSR/hydration or when useMe query is in initial pending state
  const isAuthResolving = !mounted || isLoadingAuth || isPendingAuth;
  const isGuest = !isAuthResolving && (!me || isGuestIdentity(me));

  // Only execute analytics API query when user is authenticated (prevents wasted 401/403 network calls)
  const {
    data,
    isLoading: isLoadingAnalytics,
    isPending: isPendingAnalytics,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnalyticsOverview(selectedSubjectId ?? undefined, period, {
    enabled: mounted && !isAuthResolving && !isGuest && Boolean(me),
  });

  const isLoading = isAuthResolving || (!isGuest && (isLoadingAnalytics || (isPendingAnalytics && !data)));

  return (
    <div className="flex flex-col gap-5 py-2 w-full max-w-5xl mx-auto px-2 sm:px-4 animate-in fade-in duration-300">
      {/* ── Page Header & Period Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight">
            ANALYTICS
          </h1>
          <p className="text-xs font-bold text-text-secondary mt-0.5">
            See how your learning is improving and track your WASSCE readiness.
          </p>
        </div>

        {!isGuest && (
          <div className="flex items-center gap-2.5">
            {/* Accessible Period Selector Tabs */}
            <div
              role="tablist"
              aria-label="Select analytics period"
              className="inline-flex items-center p-0.5 bg-bg-secondary border-2 border-border rounded-xl shadow-sm"
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
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-text-primary font-black border-2 border-border shadow-[0_1.5px_0_#141827]"
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
              className="p-1.5 bg-surface hover:bg-bg-secondary border-2 border-border rounded-xl text-text-secondary hover:text-text-primary shadow-[0_1.5px_0_#141827] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh analytics data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* ── 1. LOADING STATE ── */}
      {isLoading && <AnalyticsSkeleton />}

      {/* ── 2. GUEST / UNREGISTERED SHOWCASE STATE ── */}
      {isGuest && !isLoading && (
        <div className="flex flex-col gap-4">
          {/* Hero Banner for Guests */}
          <div className="p-4 sm:p-5 md:p-6 bg-surface border-2 border-border rounded-2xl shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400 border-2 border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827] shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                    Personalized Learning Analytics
                  </h2>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-200 border border-border rounded text-text-primary">
                    Member Feature
                  </span>
                </div>
                <p className="text-xs font-bold text-text-secondary max-w-xl leading-relaxed">
                  Create a permanent account to unlock detailed accuracy trends, topic mastery breakdowns, strength & weakness diagnostics, and WASSCE exam readiness scores.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <Link
                href="/register"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-text-primary border-2 border-border rounded-xl font-black text-xs text-center shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-3.5 py-2 bg-surface hover:bg-surface-muted text-text-primary border-2 border-border rounded-xl font-black text-xs text-center shadow-[0_1.5px_0_#141827] active:translate-y-0.5 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
            <div className="p-3.5 sm:p-4 bg-surface border-2 border-border rounded-xl shadow-offset flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-sm">
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-text-primary">Accuracy & Mastery Trends</h3>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                Track exact percentage scores per subject over 7-day, 30-day, and all-time study windows.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 bg-surface border-2 border-border rounded-xl shadow-offset flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-text-primary">Weak Topic Detection</h3>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                Automatically identifies syllabus topics where you need reinforcement before mock examinations.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 bg-surface border-2 border-border rounded-xl shadow-offset flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-sm">
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-text-primary">Exam Readiness Scoring</h3>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                Synthesizes mock quizzes, timed attempts, and journey nodes into a unified readiness forecast.
              </p>
            </div>
          </div>

          {/* Direct CTA to start practice */}
          <div className="p-4 sm:p-5 bg-bg-secondary/70 border-2 border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-black text-text-primary">
                  Ready to test your knowledge right now?
                </span>
                <span className="text-xs font-bold text-text-secondary">
                  You can still take practice quizzes and explore curriculum topics as a guest.
                </span>
              </div>
            </div>
            <Link
              href="/study"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all whitespace-nowrap"
            >
              Start Practice Quiz
            </Link>
          </div>
        </div>
      )}

      {/* ── 3. ERROR STATE (Authenticated users with transient network issues) ── */}
      {!isGuest && isError && !isLoading && (
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-xl shadow-offset flex flex-col items-center text-center gap-2.5">
          <AlertCircle className="w-7 h-7 text-rose-600" />
          <h2 className="text-sm sm:text-base font-extrabold text-rose-900">
            Failed to load learning insights
          </h2>
          <p className="text-xs text-rose-700 max-w-md">
            {error instanceof Error ? error.message : "An unexpected error occurred while loading analytics data."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-[0_1.5px_0_#141827] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── 4. POPULATED OR EMPTY STATE (Authenticated users) ── */}
      {!isGuest && data && !isLoading && (
        <div id="analytics-content" role="tabpanel" aria-labelledby={`period-tab-${period}`}>
          {data.isCalculating || (data.hasCompletedAttempts && data.snapshot.quizzesCompleted === 0) ? (
            <AnalyticsCalculatingState onRefresh={() => refetch()} isFetching={isFetching} />
          ) : data.snapshot.quizzesCompleted === 0 && data.snapshot.questionsCompleted === 0 ? (
            <AnalyticsEmptyState />
          ) : (
            <div className="flex flex-col gap-5 sm:gap-6">
              {/* 1. PERFORMANCE SNAPSHOT (Accuracy, Questions, Time) */}
              <section aria-labelledby="heading-snapshot" className="flex flex-col gap-2.5">
                <h2 id="heading-snapshot" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  PERFORMANCE SNAPSHOT
                </h2>
                <PerformanceSnapshotCard snapshot={data.snapshot} insights={data.insights} />
              </section>

              {/* 2. PERFORMANCE TREND ("Am I improving?") */}
              {data.trend && (
                <section aria-labelledby="heading-trend" className="flex flex-col gap-2.5">
                  <h2 id="heading-trend" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                    PERFORMANCE TREND
                  </h2>
                  <PerformanceTrendCard trend={data.trend} />
                </section>
              )}

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

              {/* 3. SUBJECT PERFORMANCE */}
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

              {/* 4. TOPIC MASTERY */}
              <section aria-labelledby="heading-mastery" className="flex flex-col gap-2.5">
                <h2 id="heading-mastery" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  TOPIC MASTERY
                </h2>
                <TopicMasteryBreakdownCard mastery={data.topicMastery} />
              </section>

              {/* 5. JOURNEY PROGRESS (Next Action & Milestone Completion) */}
              <section aria-labelledby="heading-journey" className="flex flex-col gap-2.5">
                <h2 id="heading-journey" className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  JOURNEY PROGRESS
                </h2>
                <JourneyProgressCard journeyProgress={data.journeyProgress} />
              </section>

              {/* 6. MULTIPLAYER STATISTICS (Rendered only when meaningful competitive data exists) */}
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
