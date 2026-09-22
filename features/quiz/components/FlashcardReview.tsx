"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { FlashcardDto } from "../types";

interface FlashcardReviewProps {
  flashcards: FlashcardDto[];
  onStartQuiz: () => void;
  onSkip: () => void;
  title?: string;
}

type AssessmentLevel = "again" | "hard" | "good" | "easy";

const ASSESSMENT_BUTTONS: { level: AssessmentLevel; label: string; cls: string }[] = [
  { level: "again", label: "Again", cls: "bg-surface hover:bg-surface-muted text-text-primary" },
  { level: "hard",  label: "Hard",  cls: "bg-surface hover:bg-surface-muted text-text-primary" },
  { level: "good",  label: "Good",  cls: "bg-secondary hover:brightness-95 text-text-primary" },
  { level: "easy",  label: "Easy",  cls: "bg-primary hover:brightness-95 text-text-primary" },
];

function getDifficultyBadge(difficulty?: string | null): string {
  switch (difficulty?.toLowerCase()) {
    case "easy":   return "bg-secondary border-border text-text-primary";
    case "hard":   return "bg-surface-muted border-border text-text-primary";
    case "medium":
    default:       return "bg-primary border-border text-text-primary";
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

  // ── Completion Screen ──────────────────────────────────────────────────────
  if (allReviewed) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl p-8 text-center flex flex-col items-center gap-6 shadow-[0_6px_0_rgba(20,24,39,0.9)]">
        <div className="w-16 h-16 rounded-2xl bg-secondary border-[3px] border-border flex items-center justify-center shadow-[0_4px_0_rgba(20,24,39,0.9)]">
          <CheckCircle2 size={30} className="text-text-primary" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black text-text-primary">All Flashcards Reviewed!</h3>
          <p className="text-sm font-medium text-text-secondary max-w-sm mx-auto leading-relaxed">
            You&apos;ve completed all {flashcards.length} cards in this set. You are ready to start your practice quiz!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => { setReviewedSet(new Set()); setCurrentIndex(0); setIsFlipped(false); }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface border-[2px] border-border rounded-xl font-black text-sm text-text-primary hover:bg-surface-muted active:translate-y-0.5 transition-all cursor-pointer"
          >
            <RotateCcw size={15} strokeWidth={2.5} />
            Review Again
          </button>
          <button
            type="button"
            onClick={onStartQuiz}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary border-[2px] border-border rounded-xl font-black text-sm text-text-primary shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] transition-all cursor-pointer"
          >
            <Sparkles size={15} strokeWidth={2.5} />
            Start Practice Quiz
          </button>
        </div>
      </div>
    );
  }

  const diffBadge = getDifficultyBadge(currentCard.difficulty);
  const topicText = getTopicLabel(currentCard);
  const explanationText = getExplanation(currentCard);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-text-primary">
            {reviewedCount} / {flashcards.length} reviewed
          </span>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border-[2px] uppercase tracking-wider ${diffBadge}`}>
            {currentCard.difficulty ?? "medium"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <button
            type="button"
            onClick={() => setShowKbdHelp((p) => !p)}
            className="w-6 h-6 rounded-lg border-[2px] border-border bg-surface hover:bg-surface-muted text-text-secondary flex items-center justify-center text-xs font-black font-mono transition-colors cursor-pointer"
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* ── Keyboard Help Tooltip (Collapsible) ── */}
      {showKbdHelp && (
        <div className="p-3 bg-surface border-[2px] border-border rounded-xl text-xs flex justify-around text-text-secondary font-medium">
          <span>
            <kbd className="px-1.5 py-0.5 bg-surface-muted border-[2px] border-border rounded-lg font-black">←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-surface-muted border-[2px] border-border rounded-lg font-black">→</kbd>{" "}
            Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-surface-muted border-[2px] border-border rounded-lg font-black">Space</kbd>{" "}
            Flip
          </span>
        </div>
      )}

      {/* ── 3-D Flip Card ──────────────────────────────────────────────────── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleFlip}
        className="w-full relative cursor-pointer select-none perspective-[1200px] min-h-[320px] sm:min-h-[360px]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFlip(); } }}
        aria-label={isFlipped ? "Showing answer — click to show question" : "Showing question — click to reveal answer"}
      >
        <div
          className="w-full min-h-[320px] sm:min-h-[360px] relative transition-transform duration-500 rounded-2xl border-[3px] border-border bg-surface shadow-[0_6px_0_rgba(20,24,39,0.9)]"
          style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRONT — Question */}
          <div
            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-2xl bg-surface"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-secondary truncate pr-2">{topicText}</span>
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border-[2px] border-border bg-surface-muted text-text-secondary shrink-0">QUESTION</span>
            </div>
            <div className="my-auto py-4 text-center">
              <p className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed max-w-lg mx-auto">
                {currentCard.front}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-wider">
              <Eye size={13} strokeWidth={2.5} />
              Tap to reveal answer
            </div>
          </div>

          {/* BACK — Answer + Explanation */}
          <div
            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-2xl bg-surface overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-secondary truncate pr-2">{topicText}</span>
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border-[2px] border-border bg-primary text-text-primary shrink-0">ANSWER</span>
            </div>
            <div className="my-auto py-4 space-y-4 text-center">
              <p className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed">
                {currentCard.back}
              </p>
              <div className="p-4 rounded-xl bg-surface-muted border-[2px] border-border text-left">
                <span className="text-[10px] font-black tracking-wider uppercase text-text-secondary block mb-1.5">EXPLANATION</span>
                <p className="text-xs text-text-primary leading-relaxed font-medium">{explanationText}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-wider">
              <Eye size={13} strokeWidth={2.5} />
              Tap to view question
            </div>
          </div>
        </div>
      </div>

      {/* ── Self-Assessment Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {ASSESSMENT_BUTTONS.map(({ level, label, cls }) => (
          <button
            key={level}
            type="button"
            onClick={() => handleAssessment(level)}
            className={`py-2.5 px-2 rounded-xl border-[2px] border-border font-black text-xs transition-all active:translate-y-0.5 cursor-pointer ${cls}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Bottom Nav ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border-[2px] border-border rounded-xl font-black text-xs text-text-primary bg-surface hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          PREV
        </button>

        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 border-[2px] border-border rounded-xl font-black text-xs text-text-primary bg-surface hover:bg-surface-muted transition-all cursor-pointer"
        >
          {isFlipped ? "QUESTION" : "REVEAL"}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border-[2px] border-border rounded-xl font-black text-xs text-text-primary bg-surface hover:bg-surface-muted transition-all cursor-pointer"
        >
          NEXT
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Skip ─────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onStartQuiz}
        className="text-center text-xs font-black text-text-secondary hover:text-text-primary transition-colors cursor-pointer underline underline-offset-4"
      >
        Skip review — go straight to quiz
      </button>
    </div>
  );
}
