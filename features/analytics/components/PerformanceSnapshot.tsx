// features/analytics/components/PerformanceSnapshot.tsx

import React from "react";
import Link from "next/link";
import { Target, Clock, Award, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import type { PerformanceSnapshot, ActionableInsight } from "../types";

interface PerformanceSnapshotProps {
  snapshot: PerformanceSnapshot;
  insights?: ActionableInsight[];
}

export function PerformanceSnapshotCard({ snapshot, insights }: PerformanceSnapshotProps) {
  const {
    overallAccuracy,
    questionsCompleted,
    quizzesCompleted,
    masteryPercentage,
    studyTimeMinutes,
    headline,
  } = snapshot;

  const primaryInsight = insights && insights.length > 0 ? insights[0] : null;

  const formatStudyTime = (mins: number) => {
    if (!mins || mins <= 0) return "—";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${h}h ${remainingMins}m` : `${h}h`;
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Headline / Actionable Learning Insight ── */}
      {primaryInsight ? (
        <div className="p-4 sm:p-5 bg-bg-secondary border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/30 border-2 border-border flex items-center justify-center shrink-0 text-text-primary shadow-[0_2px_0_#141827]">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-amber-600" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  Actionable Insight
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-text-primary leading-snug">
                  {primaryInsight.message}
                </p>
              </div>
            </div>
            {primaryInsight.actionLabel && primaryInsight.actionUrl && (
              <Link
                href={primaryInsight.actionUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-black text-text-primary bg-primary hover:bg-yellow-400 border-2 border-border rounded-xl shadow-[0_2px_0_#141827] hover:translate-y-0.5 hover:shadow-none transition-all shrink-0 cursor-pointer self-stretch sm:self-auto text-center"
              >
                <span>{primaryInsight.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {insights && insights.length > 1 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-border/20 text-xs font-bold text-text-secondary">
              {insights.slice(1, 3).map((insight) => (
                <div key={insight.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{insight.message}</span>
                  {insight.actionLabel && insight.actionUrl && (
                    <Link
                      href={insight.actionUrl}
                      className="text-text-primary font-black hover:underline ml-0.5"
                    >
                      {insight.actionLabel} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : headline ? (
        <div className="p-4 sm:p-5 bg-bg-secondary border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex items-start gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/30 border-2 border-border flex items-center justify-center shrink-0 text-text-primary shadow-[0_2px_0_#141827]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-amber-600" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Learning Insight
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-text-primary leading-snug">
              {headline}
            </p>
          </div>
        </div>
      ) : null}

      {/* ── 4 Primary Metric Tiles: 1. Accuracy, 2. Mastery, 3. Questions, 4. Study Time ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Accuracy */}
        <div className="p-3.5 sm:p-5 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150 ease-out min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-text-secondary truncate">Accuracy</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-secondary/35 text-text-primary border-2 border-border flex items-center justify-center shadow-[0_1px_0_#141827] shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight truncate">
              {overallAccuracy !== null ? `${overallAccuracy}%` : "—"}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary mt-1.5 sm:mt-2 truncate">
            {overallAccuracy !== null ? "Across answered questions" : "No answers yet"}
          </span>
        </div>

        {/* 2. Mastery (Prioritized) */}
        <div className="p-3.5 sm:p-5 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150 ease-out min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-text-secondary truncate">Mastery</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/40 text-text-primary border-2 border-border flex items-center justify-center shadow-[0_1px_0_#141827] shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight truncate">
              {masteryPercentage !== null ? `${masteryPercentage}%` : "—"}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary mt-1.5 sm:mt-2 truncate">
            {masteryPercentage !== null ? "Curriculum mastery" : "Building topic mastery"}
          </span>
        </div>

        {/* 3. Questions */}
        <div className="p-3.5 sm:p-5 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150 ease-out min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-text-secondary truncate">Questions</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-bg-secondary text-text-primary border-2 border-border flex items-center justify-center shadow-[0_1px_0_#141827] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight truncate">
              {questionsCompleted.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary mt-1.5 sm:mt-2 truncate">
            {quizzesCompleted > 0 ? `${quizzesCompleted} quizzes completed` : "Ready to practice"}
          </span>
        </div>

        {/* 4. Study Time */}
        <div className="p-3.5 sm:p-5 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150 ease-out min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-text-secondary truncate">Study Time</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-muted text-text-primary border-2 border-border flex items-center justify-center shadow-[0_1px_0_#141827] shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight truncate">
              {formatStudyTime(studyTimeMinutes)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary mt-1.5 sm:mt-2 truncate">
            {studyTimeMinutes > 0 ? "Active practice time" : "Take a quiz to track time"}
          </span>
        </div>
      </div>
    </div>
  );
}
