// features/analytics/components/SubjectPerformance.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { SubjectPerformanceItem } from "../types";

interface SubjectPerformanceProps {
  subjects: SubjectPerformanceItem[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  isPro: boolean;
}

const ITEMS_PER_PAGE = 2;

export function SubjectPerformanceCard({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: SubjectPerformanceProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const filteredSubjects = selectedSubjectId
    ? subjects.filter((s) => s.id === selectedSubjectId)
    : subjects;

  // Reset pagination if filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedSubjectId]);

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const currentSubjects = filteredSubjects.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (diffX > 50 && currentPage < totalPages - 1) {
      // Swiped left -> next page
      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
    } else if (diffX < -50 && currentPage > 0) {
      // Swiped right -> previous page
      setCurrentPage((prev) => Math.max(0, prev - 1));
    }
    setTouchStartX(null);
  };

  return (
    <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4">
      {/* ── Subject Filter Pills & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1px_0_#141827]">
            <BookOpen className="w-4 h-4 stroke-[2]" />
          </div>
          <span className="text-xs font-bold text-text-secondary">
            Filter by Subject
          </span>
        </div>

        {/* ── Subject Filter Pills ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => onSelectSubject(null)}
            className={`px-3 py-1 text-xs font-black rounded-lg border-2 border-border transition-all cursor-pointer whitespace-nowrap shadow-[0_2px_0_#141827] ${
              selectedSubjectId === null
                ? "bg-primary text-text-primary"
                : "bg-surface hover:bg-bg-secondary text-text-secondary"
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className={`px-3 py-1 text-xs font-black rounded-lg border-2 border-border transition-all cursor-pointer whitespace-nowrap shadow-[0_2px_0_#141827] ${
                selectedSubjectId === sub.id
                  ? "bg-primary text-text-primary"
                  : "bg-surface hover:bg-bg-secondary text-text-secondary"
              }`}
            >
              {sub.code || sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Compact Subjects Grid (Max 4 per page with touch swipe support) ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1"
      >
        {currentSubjects.map((sub) => {
          const accuracyVal =
            sub.averageScore !== null && sub.averageScore !== undefined
              ? Math.round(sub.averageScore)
              : null;
          const accuracyDisplay = accuracyVal !== null ? `${accuracyVal}%` : "—";

          const masteryVal =
            sub.mastery !== null && sub.mastery !== undefined
              ? Math.round(sub.mastery)
              : null;
          const masteryDisplay = masteryVal !== null ? `${masteryVal}%` : "—";

          let masteryBadgeColor = "bg-surface-muted text-text-secondary";
          if (sub.masteryLevel === "Mastered") masteryBadgeColor = "bg-secondary text-text-primary";
          else if (sub.masteryLevel === "Proficient") masteryBadgeColor = "bg-primary/30 text-text-primary";
          else if (sub.masteryLevel === "Developing") masteryBadgeColor = "bg-bg-secondary text-text-primary";
          else if (sub.masteryLevel === "Needs Practice") masteryBadgeColor = "bg-[#FADBD8] text-text-primary";

          // Mini progress bar color
          let progressBarColor = "bg-primary";
          if (accuracyVal !== null) {
            if (accuracyVal >= 75) progressBarColor = "bg-secondary";
            else if (accuracyVal < 50) progressBarColor = "bg-[#FADBD8]";
          }

          return (
            <div
              key={sub.id}
              className="p-4 sm:p-5 border-2 border-border rounded-2xl bg-surface shadow-[0_3px_0_#141827] flex flex-col justify-between gap-3.5 hover:-translate-y-0.5 transition-transform duration-150 ease-out"
            >
              {/* 1. Subject Header & Mastery Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    {sub.code}
                  </span>
                  <h3 className="text-sm font-black text-text-primary truncate">
                    {sub.name}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-border shrink-0 shadow-[0_1px_0_#141827] ${masteryBadgeColor}`}
                >
                  {sub.masteryLevel}
                </span>
              </div>

              {/* 2. Compact Visual Progress Indicators: Accuracy & Mastery */}
              <div className="flex flex-col gap-2.5 bg-bg-secondary/60 p-3 rounded-xl border-2 border-border/80">
                {/* Accuracy Row & Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-text-secondary">Accuracy</span>
                    <span className="font-black text-text-primary">{accuracyDisplay}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-secondary border border-border/40 overflow-hidden">
                    <div
                      style={{ width: `${accuracyVal ?? 0}%` }}
                      className={`h-full ${progressBarColor} transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* Mastery Row & Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-text-secondary">Curriculum Mastery</span>
                    <span className="font-black text-text-primary">{masteryDisplay}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bg-secondary border border-border/40 overflow-hidden">
                    <div
                      style={{ width: `${masteryVal ?? 0}%` }}
                      className="h-full bg-primary transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Question Count & Activity Details */}
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary pt-0.5">
                <div>
                  <span className="text-[10px] block uppercase text-text-secondary font-black">
                    Questions
                  </span>
                  <span className="text-xs sm:text-sm font-black text-text-primary">
                    {(sub.questionCount ?? 0).toLocaleString()} answered
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block uppercase text-text-secondary font-black">
                    Levels Done
                  </span>
                  <span className="text-xs sm:text-sm font-black text-text-primary">
                    {sub.completedLevels} of {sub.totalLevels}
                  </span>
                </div>
              </div>

              {/* 4. Action Link */}
              <Link
                href={`/study/${sub.slug}`}
                className="w-full py-2.5 bg-surface hover:bg-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150 ease-out text-text-primary"
              >
                <span>Study {sub.code || sub.name}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Pagination Controls (Swipe on touch or click Next/Prev) ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-border">
          <span className="text-xs font-bold text-text-secondary">
            Showing {currentPage * ITEMS_PER_PAGE + 1}–
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredSubjects.length)} of{" "}
            {filteredSubjects.length} courses
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              aria-label="Previous courses"
              className="px-3 py-1.5 bg-surface hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150 ease-out flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Prev</span>
            </button>

            {/* Page Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  aria-label={`Go to courses page ${idx + 1}`}
                  aria-current={currentPage === idx ? "page" : undefined}
                  className={`w-2.5 h-2.5 rounded-full border-2 border-border transition-all cursor-pointer ${
                    currentPage === idx
                      ? "bg-primary scale-125"
                      : "bg-surface hover:bg-bg-secondary"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              aria-label="Next courses"
              className="px-3 py-1.5 bg-primary hover:bg-[#ebd060] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150 ease-out flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
