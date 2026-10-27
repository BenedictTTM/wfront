"use client";
// features/multiplayer/components/RoundEvaluationDrawer.tsx

import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  Bookmark,
  BookmarkCheck,
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
  explanationText: string;
  extendedExplanationText?: string;
  isExtended?: boolean;
  onToggleExtended?: () => void;
  onBookmarkConcept: () => void;
  onNextQuestionReady?: () => void;
  isBookmarked?: boolean;
}

/**
 * Ultra-Compact Anchored Evaluation Bar
 * - Single-row inline layout saving ~80% vertical space
 * - Inline tactile Save to Revision Deck button
 * - Unobtrusive top countdown indicator & accessible screen-reader live status
 */
export const RoundEvaluationDrawer = React.memo(function RoundEvaluationDrawer({
  isOpen,
  isCorrect,
  selectedOptionId: _selectedOptionId,
  correctOptionId: _correctOptionId,
  scoreEarned,
  explanationText,
  extendedExplanationText: _extendedExplanationText,
  isExtended: _isExtended,
  onToggleExtended: _onToggleExtended,
  onBookmarkConcept,
  onNextQuestionReady,
  isBookmarked: externalIsBookmarked,
}: RoundEvaluationProps) {
  const [internalBookmarked, setInternalBookmarked] = useState(false);
  const isBookmarked = externalIsBookmarked || internalBookmarked;

  // Reset internal bookmark state on drawer close & run auto-advance countdown
  useEffect(() => {
    if (!isOpen) {
      setInternalBookmarked(false);
      return;
    }

    if (onNextQuestionReady) {
      const timer = setTimeout(() => {
        onNextQuestionReady();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onNextQuestionReady]);

  const handleBookmark = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInternalBookmarked(true);
    onBookmarkConcept();
  };

  return (
    <aside
      role="status"
      aria-live="assertive"
      aria-hidden={!isOpen}
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-250 ease-out ${
        isOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
      }`}
    >
      {/* Screen Reader Announcement for round result and score */}
      <div className="sr-only" aria-live="polite">
        {isCorrect
          ? `Correct. Earned ${scoreEarned.total} points.`
          : "Countered. Focus on concept. 0 points earned."}
      </div>

      <div className="max-w-3xl mx-auto px-2 sm:px-4 pointer-events-auto">
        <div className="w-full rounded-t-xl sm:rounded-t-2xl border-t-[2.5px] border-x-[2.5px] border-[#141827] bg-[#FAF8F5] shadow-[0_-4px_0_#141827] overflow-hidden flex flex-col">
          {/* Micro Countdown Progress Line */}
          <div
            className="w-full h-1 bg-[#FAF8F5] border-b border-[#141827]/15 overflow-hidden shrink-0"
            role="progressbar"
            aria-label="Next round countdown"
          >
            <div
              className={`h-full transition-all duration-[4000ms] ease-linear ${
                isOpen ? "w-full" : "w-0"
              } ${isCorrect ? "bg-emerald-500" : "bg-[#FFE600]"}`}
            />
          </div>

          {/* Compact Main Content Row */}
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col">
            <div className="flex items-center justify-between gap-3 min-h-[38px]">
              {/* Concept Indicator & Explanation */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFE600] border-[1.5px] border-[#141827] text-[#141827] text-[10px] font-black tracking-wider uppercase shrink-0 shadow-[0_1.5px_0_#141827]"
                  aria-hidden="true"
                >
                  <Lightbulb size={12} className="stroke-[2.5] text-[#141827]" />
                  <span className="hidden sm:inline">CONCEPT</span>
                </div>

                <p className="text-xs sm:text-[13px] font-bold text-[#141827] leading-snug truncate sm:whitespace-normal">
                  {explanationText}
                </p>
              </div>

              {/* Action Buttons: Save to Revision Deck */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBookmark}
                  disabled={isBookmarked}
                  aria-label={
                    isBookmarked
                      ? "Saved to Revision Deck"
                      : "Save to Revision Deck"
                  }
                  title={
                    isBookmarked
                      ? "Saved to Revision Deck"
                      : "Save to Revision Deck"
                  }
                  className={`relative z-10 pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-[1.5px] border-[#141827] font-black text-[11px] sm:text-xs tracking-wide uppercase transition-all shadow-[0_2px_0_#141827] active:translate-y-0.5 cursor-pointer ${
                    isBookmarked
                      ? "bg-emerald-100 text-emerald-800 border-emerald-900 shadow-none cursor-default"
                      : "bg-white hover:bg-slate-100 text-[#141827]"
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck
                        size={14}
                        className="stroke-[2.5] text-emerald-600"
                      />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={14} className="stroke-[2.5] text-[#141827]" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});