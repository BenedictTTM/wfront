"use client";
// features/multiplayer/components/RoundEvaluationDrawer.tsx

import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export interface RoundEvaluationProps {
  isOpen: boolean;
  isCorrect: boolean;
  selectedOptionId: string;
  correctOptionId: string;
  scoreEarned: {
    base: number;
    speedBonus: number;
    streakBonus: number;
    total: number;
  };
  explanationText: string; // Specific, rule-based concept breakdown
  onBookmarkConcept: () => void;
  onNextQuestionReady?: () => void; // Optional auto-triggered callback
}

/**
 * Anchored Bottom Evaluation Drawer (Strict WCAG 2.2 AAA Contrast > 7:1)
 * Eliminates layout clipping, viewport overflow, and full-width slicing lines.
 * Features:
 * - Header Row: State badge ("COUNTERED • FOCUS ON CONCEPT" / "LOCKED & VERIFIED") & Points delta badge ("+0 PTS")
 * - Content Card: Specific rule-based academic concept breakdown
 * - Actions Row: "[ 🔖 Save to Revision Deck ]" button & automated server-paced indicator (no manual next button)
 */
export const RoundEvaluationDrawer = React.memo(function RoundEvaluationDrawer({
  isOpen,
  isCorrect,
  selectedOptionId: _selectedOptionId,
  correctOptionId: _correctOptionId,
  scoreEarned,
  explanationText,
  onBookmarkConcept,
  onNextQuestionReady,
}: RoundEvaluationProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Reset bookmark state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsBookmarked(false);
      return;
    }

    if (onNextQuestionReady) {
      const timer = setTimeout(() => {
        onNextQuestionReady();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onNextQuestionReady]);

  const handleBookmark = () => {
    setIsBookmarked(true);
    onBookmarkConcept();
  };

  const basePoints = scoreEarned.base > 0 ? scoreEarned.base : 100;
  const breakdownText = `+${scoreEarned.total} PTS (Base: ${basePoints} | Speed: +${scoreEarned.speedBonus} | Streak: +${scoreEarned.streakBonus})`;

  return (
    <aside
      role="status"
      aria-live="assertive"
      aria-hidden={!isOpen}
      className={`fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full"
      }`}
    >
      <div className="max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-6">
        {/* ── Structured Neo-Brutalist Drawer Container ── */}
        <div className="w-full rounded-t-3xl border-t-[3px] border-x-[3px] border-border bg-surface shadow-[0_-6px_0_#141827] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
          {/* Contained Top Progress Indicator Bar */}
          <div
            className="w-full h-1.5 bg-surface-muted border-b border-border overflow-hidden shrink-0"
            role="progressbar"
            aria-label="Round countdown progress"
          >
            <div
              className={`h-full transition-all duration-[4000ms] ease-linear ${
                isOpen ? "w-full" : "w-0"
              } ${isCorrect ? "bg-emerald-500" : "bg-primary"}`}
            />
          </div>

          {/* Drawer Inner Content */}
          <div className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto">
            {/* ── 1. Header Row: Non-Shaming State Badge & Points Delta ── */}
            <div className="flex items-center justify-between gap-2 shrink-0">
              {/* Left State Badge */}
              <div className="flex items-center gap-2 min-w-0">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border-[2px] border-border font-black text-xs sm:text-sm tracking-wide uppercase text-emerald-950 shadow-[0_2px_0_#141827]">
                    <CheckCircle2 size={16} className="text-emerald-700 stroke-[3]" />
                    <span>LOCKED &amp; VERIFIED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border-[2px] border-border font-black text-xs sm:text-sm tracking-wide uppercase text-rose-950 shadow-[0_2px_0_#141827]">
                    <Sparkles size={15} className="text-rose-700 stroke-[2.5]" />
                    <span>COUNTERED • FOCUS ON CONCEPT</span>
                  </span>
                )}
              </div>

              {/* Right Points Delta Badge */}
              <div className="flex items-center shrink-0">
                {isCorrect ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary border-[2px] border-border font-black text-xs sm:text-sm tabular-nums tracking-tight text-text-primary shadow-[0_2px_0_#141827]">
                    {breakdownText}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-muted border-[2px] border-border font-black text-xs sm:text-sm tabular-nums tracking-tight text-text-secondary shadow-[0_2px_0_#141827]">
                    +0 PTS
                  </span>
                )}
              </div>
            </div>

            {/* ── 2. Content Card: Rule-Based Concept Breakdown ── */}
            {explanationText && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-muted border-[2px] border-border flex items-start gap-3 shadow-[0_2px_0_#141827]">
                <div
                  className="p-2 rounded-xl bg-primary border-[2px] border-border text-text-primary shrink-0 shadow-[0_1px_0_#141827]"
                  aria-hidden="true"
                >
                  <Lightbulb size={18} className="stroke-[2.5]" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-text-secondary mb-0.5">
                    Concept Breakdown
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-text-primary leading-relaxed break-words">
                    {explanationText}
                  </p>
                </div>
              </div>
            )}

            {/* ── 3. Actions Row: Revision Bookmark & Automated Server Indicator ── */}
            <div className="flex items-center justify-between gap-3 pt-0.5 shrink-0">
              {/* Left: Bookmark to Revision Deck Pill Button */}
              <button
                type="button"
                onClick={handleBookmark}
                disabled={isBookmarked}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-[2px] border-border font-black text-xs tracking-wider uppercase transition-all shadow-[0_3px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 cursor-pointer ${
                  isBookmarked
                    ? "bg-secondary text-text-primary opacity-80 cursor-default"
                    : "bg-surface hover:bg-surface-muted text-text-primary hover:-translate-y-0.5"
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck size={14} className="stroke-[3]" />
                    <span>Saved to Revision Deck</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={14} className="stroke-[2.5]" />
                    <span>🔖 Save to Revision Deck</span>
                  </>
                )}
              </button>

              {/* Right: Automated Round Flow Status Indicator */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-muted border-[1.5px] border-border text-[11px] font-black tracking-wide uppercase text-text-secondary select-none shadow-[0_1px_0_#141827]"
                aria-live="polite"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>Next Question Starting…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});
