// features/analytics/components/TopicMasteryBreakdown.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Award, ChevronDown, ChevronUp, ArrowRight, AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import type { TopicMasterySummary, TopicMasteryBreakdownItem } from "../types";

export interface TopicMasteryBreakdownProps {
  mastery?: TopicMasterySummary | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type FilterTab = "ALL" | "NEEDS_PRACTICE" | "DEVELOPING" | "MASTERED";

const INITIAL_VISIBLE_COUNT = 6;

export function TopicMasteryBreakdownCard({
  mastery,
  isLoading = false,
  error = null,
  onRetry,
}: TopicMasteryBreakdownProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [isExpanded, setIsExpanded] = useState(false);

  const breakdown = useMemo(() => mastery?.breakdown ?? [], [mastery?.breakdown]);

  // Filter topics based on active tab — called unconditionally at top level
  const filteredTopics = useMemo(() => {
    if (activeTab === "NEEDS_PRACTICE") {
      return breakdown.filter((item) => item.status === "NEEDS_PRACTICE");
    }
    if (activeTab === "DEVELOPING") {
      return breakdown.filter((item) => item.status === "DEVELOPING");
    }
    if (activeTab === "MASTERED") {
      return breakdown.filter(
        (item) => item.status === "MASTERED" || item.status === "PROFICIENT"
      );
    }
    return breakdown;
  }, [breakdown, activeTab]);

  // ── 1. LOADING STATE ──
  if (isLoading) {
    return <TopicMasteryBreakdownSkeleton />;
  }

  // ── 2. ERROR STATE ──
  if (error) {
    return (
      <div className="p-6 bg-rose-50 border-2.5 border-rose-300 rounded-2xl shadow-[0_3px_0_#141827] flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-8 h-8 text-rose-600" />
        <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
          Unable to load topic mastery
        </h3>
        <p className="text-xs text-rose-800 max-w-md">
          {error || "An unexpected error occurred while retrieving your topic breakdown."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 px-4 py-2 bg-surface hover:bg-rose-100 border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // ── 3. EMPTY STATE ──
  if (!mastery || mastery.total === 0 || !mastery.breakdown || mastery.breakdown.length === 0) {
    return (
      <div className="p-6 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-border flex items-center justify-center text-[#FF9E2C] shadow-[0_2px_0_#141827]">
          <Award className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wide">
            No Topic Mastery Recorded Yet
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Answer questions and complete quizzes across your curriculum subjects to build comprehensive topic mastery insights.
          </p>
        </div>
        <Link
          href="/study"
          className="mt-1 px-4 py-2 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Start Practicing</span>
        </Link>
      </div>
    );
  }

  const { mastered, proficient, developing, needsPractice, total } = mastery;

  // Calculate percentages for the stacked distribution bar
  const safeTotal = Math.max(1, total);
  const masteredPct = (mastered / safeTotal) * 100;
  const proficientPct = (proficient / safeTotal) * 100;
  const developingPct = (developing / safeTotal) * 100;
  const needsPracticePct = (needsPractice / safeTotal) * 100;

  const visibleTopics = isExpanded
    ? filteredTopics
    : filteredTopics.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = Math.max(0, filteredTopics.length - INITIAL_VISIBLE_COUNT);

  return (
    <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4">
      {/* ── Topic Overview Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/30 border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1px_0_#141827]">
            <Award className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
              Topic Breakdown
            </h3>
            <p className="text-[11px] font-bold text-text-secondary">
              Mastered concepts and focus areas across your studies
            </p>
          </div>
        </div>
        <div className="text-xs font-black text-text-primary self-start sm:self-auto bg-bg-secondary px-2.5 py-1 rounded-lg border border-border">
          {total} Topic{total === 1 ? "" : "s"} Tracked
        </div>
      </div>

      {/* ── Distribution Bar ── */}
      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Topic mastery breakdown distribution"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(masteredPct + proficientPct)}
          className="h-4 w-full rounded-full border-2 border-border bg-bg-secondary flex overflow-hidden shadow-[0_2px_0_#141827]"
        >
          {masteredPct > 0 && (
            <div
              style={{ width: `${masteredPct}%` }}
              className="bg-emerald-400 h-full border-r border-border transition-all"
              title={`Mastered: ${mastered}`}
            />
          )}
          {proficientPct > 0 && (
            <div
              style={{ width: `${proficientPct}%` }}
              className="bg-blue-400 h-full border-r border-border transition-all"
              title={`Proficient: ${proficient}`}
            />
          )}
          {developingPct > 0 && (
            <div
              style={{ width: `${developingPct}%` }}
              className="bg-amber-400 h-full border-r border-border transition-all"
              title={`Developing: ${developing}`}
            />
          )}
          {needsPracticePct > 0 && (
            <div
              style={{ width: `${needsPracticePct}%` }}
              className="bg-rose-400 h-full transition-all"
              title={`Needs Practice: ${needsPractice}`}
            />
          )}
        </div>

        {/* ── Filter Tabs / Legend ── */}
        <div
          role="tablist"
          aria-label="Filter topics by mastery status"
          className="flex items-center flex-wrap gap-1.5 pt-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ALL"}
            onClick={() => {
              setActiveTab("ALL");
              setIsExpanded(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-text-primary text-surface border-border shadow-[0_1px_0_#141827]"
                : "bg-bg-secondary text-text-secondary border-border/70 hover:text-text-primary"
            }`}
          >
            All ({total})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "NEEDS_PRACTICE"}
            onClick={() => {
              setActiveTab("NEEDS_PRACTICE");
              setIsExpanded(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "NEEDS_PRACTICE"
                ? "bg-rose-500 text-white border-border shadow-[0_1px_0_#141827]"
                : "bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 border border-border shrink-0" />
            Needs Attention ({needsPractice})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "DEVELOPING"}
            onClick={() => {
              setActiveTab("DEVELOPING");
              setIsExpanded(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "DEVELOPING"
                ? "bg-amber-500 text-white border-border shadow-[0_1px_0_#141827]"
                : "bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 border border-border shrink-0" />
            Developing ({developing})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "MASTERED"}
            onClick={() => {
              setActiveTab("MASTERED");
              setIsExpanded(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "MASTERED"
                ? "bg-emerald-600 text-white border-border shadow-[0_1px_0_#141827]"
                : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 border border-border shrink-0" />
            Mastered ({mastered + proficient})
          </button>
        </div>
      </div>

      {/* ── Topic Cards Grid ── */}
      {visibleTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {visibleTopics.map((item) => (
            <TopicMasteryItemCard key={item.topicId} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-bold text-text-secondary bg-bg-secondary/40 rounded-xl border border-dashed border-border/40 p-4">
          No topics in this category yet.
        </div>
      )}

      {/* ── View More / Show Less Toggle ── */}
      {filteredTopics.length > INITIAL_VISIBLE_COUNT && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="px-4 py-2 bg-surface hover:bg-bg-secondary border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>View More ({remainingCount} more)</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Subcomponent: Topic Card ──
function TopicMasteryItemCard({ item }: { item: TopicMasteryBreakdownItem }) {
  let badgeStyle = "bg-gray-100 text-gray-800 border-gray-300";
  let isActionUrgent = false;

  if (item.status === "MASTERED") {
    badgeStyle = "bg-emerald-100 text-emerald-900 border-emerald-300";
  } else if (item.status === "PROFICIENT") {
    badgeStyle = "bg-blue-100 text-blue-900 border-blue-300";
  } else if (item.status === "DEVELOPING") {
    badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";
    isActionUrgent = true;
  } else {
    badgeStyle = "bg-rose-100 text-rose-900 border-rose-300";
    isActionUrgent = true;
  }

  const practiceUrl = item.subjectId
    ? `/study/quiz?subjectId=${encodeURIComponent(item.subjectId)}&topicId=${encodeURIComponent(item.topicId)}`
    : `/study/quiz?topicId=${encodeURIComponent(item.topicId)}`;

  // Question count & accuracy meta
  const questionCount = item.questionCount ?? 0;
  const hasSufficientData = questionCount >= 5;
  const accuracy = item.accuracy !== undefined ? Math.round(item.accuracy) : Math.round(item.score);

  return (
    <div className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex items-center justify-between gap-2.5 shadow-[0_2px_0_#141827] hover:border-border transition-all">
      {/* Topic Title & Subject Meta */}
      <div className="min-w-0 flex-1">
        <span
          className="text-[10px] font-black uppercase text-text-secondary truncate block tracking-wider"
          title={item.subjectName}
        >
          {item.subjectName}
        </span>
        <h4
          className="text-xs font-black text-text-primary truncate"
          title={item.topicName}
        >
          {item.topicName}
        </h4>

        {/* Accuracy and question count meta */}
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-text-secondary">
          {hasSufficientData ? (
            <>
              <span>{questionCount} answered</span>
              <span>•</span>
              <span className="text-text-primary font-black">{accuracy}% accuracy</span>
            </>
          ) : questionCount > 0 ? (
            <span>Building data ({questionCount} answered)</span>
          ) : (
            <span>No quiz attempts yet</span>
          )}
        </div>
      </div>

      {/* Mastery Score & Action CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}
        >
          {item.score}%
        </span>

        {/* Direct Link to Journey/Practice */}
        <Link
          href={practiceUrl}
          aria-label={`Practice ${item.topicName}`}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-black border-2 border-border shadow-[0_1.5px_0_#141827] flex items-center gap-1 transition-all cursor-pointer ${
            isActionUrgent
              ? "bg-primary hover:bg-primary-hover text-text-primary"
              : "bg-surface hover:bg-bg-secondary text-text-primary"
          }`}
        >
          <span>{isActionUrgent ? "Practice" : "Review"}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Subcomponent: Loading Skeleton ──
export function TopicMasteryBreakdownSkeleton() {
  return (
    <div className="p-5 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border" />
          <div className="flex flex-col gap-1.5">
            <div className="w-28 h-3.5 bg-bg-secondary rounded" />
            <div className="w-48 h-2.5 bg-bg-secondary rounded" />
          </div>
        </div>
        <div className="w-24 h-5 bg-bg-secondary rounded" />
      </div>

      {/* Bar skeleton */}
      <div className="h-4 w-full rounded-full bg-bg-secondary border border-border" />

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-bg-secondary rounded-lg" />
        <div className="w-24 h-6 bg-bg-secondary rounded-lg" />
        <div className="w-20 h-6 bg-bg-secondary rounded-lg" />
        <div className="w-20 h-6 bg-bg-secondary rounded-lg" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-bg-secondary border-2 border-border rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
