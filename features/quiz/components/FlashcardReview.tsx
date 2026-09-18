"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { FlashcardDto } from "../types";

interface FlashcardReviewProps {
  flashcards: FlashcardDto[];
  onStartQuiz: () => void;
  onSkip: () => void;
  title?: string;
}

type AssessmentLevel = "again" | "hard" | "good" | "easy";

function getDifficultyBadge(difficulty?: string | null) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return { bg: "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]", label: "easy" };
    case "hard":
      return { bg: "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]", label: "hard" };
    case "medium":
    default:
      return { bg: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]", label: "medium" };
  }
}

// Fallback dummy explanation if backend has not populated explanation field yet
function getExplanation(card: FlashcardDto): string {
  if (card.explanation && card.explanation.trim().length > 0) {
    return card.explanation;
  }

  const topicName = card.topic || "this concept";
  return `Understanding this hierarchy is fundamental: ${topicName} sets the core principles, defining the 'what' (logical contract), while structured practice provides the 'how' (implementation).`;
}

// Fallback topic name
function getTopicLabel(card: FlashcardDto): string {
  if (card.topic && card.topic.trim().length > 0) {
    return card.topic.toUpperCase();
  }
  return "FOUNDATIONS AND CORE CONCEPTS";
}

export function FlashcardReview({
  flashcards,
  onStartQuiz,
}: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedSet, setReviewedSet] = useState<Set<number>>(new Set());
  const [showKbdHelp, setShowKbdHelp] = useState(false);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 40;

  const count = flashcards?.length ?? 0;

  const handleNext = useCallback(() => {
    if (count === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleAssessment = (_level: AssessmentLevel) => {
    setReviewedSet((prev) => new Set([...prev, currentIndex]));
    setTimeout(() => {
      handleNext();
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, toggleFlip]);

  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  const currentCard = flashcards[currentIndex];
  const reviewedCount = reviewedSet.size;
  const allReviewed = reviewedCount >= flashcards.length && flashcards.length > 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // ── Completion View ──────────────────────────────────────────────────────────
  if (allReviewed) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 text-center flex flex-col items-center gap-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-text-primary">
            All Flashcards Reviewed!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You&apos;ve completed all {flashcards.length} cards in this set. You are ready to start your practice quiz!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md pt-2">
          <button
            type="button"
            onClick={() => {
              setReviewedSet(new Set());
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Review Again</span>
          </button>
          <button
            type="button"
            onClick={onStartQuiz}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary,#10B981)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Start Practice Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  const diff = getDifficultyBadge(currentCard.difficulty);
  const topicText = getTopicLabel(currentCard);
  const explanationText = getExplanation(currentCard);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-card p-4 sm:p-6  text-slate-800 dark:text-text-primary font-sans">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900 dark:text-text-primary">
            {reviewedCount} / {flashcards.length} reviewed
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diff.bg}`}>
            {diff.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-slate-400">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <button
            type="button"
            onClick={() => setShowKbdHelp((prev) => !prev)}
            className="w-6 h-6 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-bold font-mono transition-colors cursor-pointer"
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>

      {/* ── Top Divider Line ── */}
      <div className="h-[1px] bg-slate-200/70 dark:bg-border w-full mb-4 sm:mb-5 mt-2" />

      {/* ── Keyboard Help Tooltip (Collapsible) ── */}
      {showKbdHelp && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-around text-slate-600 font-medium">
          <span><kbd className="px-1.5 py-0.5 bg-white border rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-white border rounded">→</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border rounded">Space</kbd> Flip Card</span>
        </div>
      )}

      {/* ── Center 3D Flip Flashcard Box ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleFlip}
        className="w-full max-w-md mx-auto relative cursor-pointer select-none perspective-[1000px] min-h-[340px] sm:min-h-[380px] mb-4 sm:mb-6"
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Showing answer. Click to show question." : "Showing question. Click to reveal answer."}
      >
        <div
          className="w-full min-h-[340px] sm:min-h-[380px] relative transition-transform duration-500 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-surface shadow-xs"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ── FRONT FACE (Question) ── */}
          <div
            className="absolute inset-0 w-full h-full p-4 sm:p-6 flex flex-col justify-between rounded-2xl bg-white dark:bg-surface"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
              <span className="truncate pr-2">{topicText}</span>
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400">
                QUESTION
              </span>
            </div>

            <div className="my-auto py-2 text-center">
              <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-text-primary leading-relaxed max-w-lg mx-auto">
                {currentCard.front}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 text-center sm:text-right font-medium">
              Click card to reveal answer
            </div>
          </div>

          {/* ── BACK FACE (Answer + Explanation) ── */}
          <div
            className="absolute inset-0 w-full h-full p-4 sm:p-6 flex flex-col justify-between rounded-2xl bg-white dark:bg-surface overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
              <span className="truncate pr-2">{topicText}</span>
              <span className="text-[10px] font-extrabold tracking-wider text-amber-500">
                ANSWER
              </span>
            </div>

            <div className="my-auto py-2 space-y-3 text-center sm:text-left">
              <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-text-primary leading-relaxed">
                {currentCard.back}
              </p>

              {/* Explanation Box */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-900/60 text-left shadow-xs">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-800 dark:text-amber-400 block mb-1.5">
                  EXPLANATION
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  {explanationText}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center sm:text-right font-medium mt-2">
              Click card to view question
            </div>
          </div>
        </div>
      </div>

      {/* ── Assessment Bar (4 Colors) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-4">
        <button
          type="button"
          onClick={() => handleAssessment("again")}
          className="w-full py-2.5 px-4 rounded-sm border border-[#FCA5A5] text-[#DC2626] bg-white hover:bg-rose-50 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-xs"
        >
          Again
        </button>
        <button
          type="button"
          onClick={() => handleAssessment("hard")}
          className="w-full py-2.5 px-4 rounded-sm border border-[#FDE68A] text-[#B45309] bg-white hover:bg-amber-50 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-xs"
        >
          Hard
        </button>
        <button
          type="button"
          onClick={() => handleAssessment("good")}
          className="w-full py-2.5 px-4 rounded-sm border border-[#BBF7D0] text-[#16A34A] bg-white hover:bg-emerald-50 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-xs"
        >
          Good
        </button>
        <button
          type="button"
          onClick={() => handleAssessment("easy")}
          className="w-full py-2.5 px-4 rounded-sm border border-[#BFDBFE] text-[#2563EB] bg-white hover:bg-blue-50 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-xs"
        >
          Easy
        </button>
      </div>

      {/* ── Bottom Divider Line ── */}
      <div className="h-[1px] bg-slate-200/70 dark:bg-border w-full mb-4" />

      {/* ── Bottom Controls ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 rounded-sm text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          ← Prev
        </button>

        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2 border border-slate-200 rounded-sm text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          {isFlipped ? "Question" : "Reveal"}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 rounded-sm text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
