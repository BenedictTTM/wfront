"use client";
// features/multiplayer/components/LiveQuestion.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Check, AlertCircle } from "lucide-react";
import { WsQuestionStartEvent, RoundRevealData } from "../types";

interface LiveQuestionProps {
  questionData: WsQuestionStartEvent;
  selectedOptionId: string | null;
  onSelect: (questionId: string, optionId: string, timeTakenMs: number) => void;
  roundReveal?: RoundRevealData | null;
  currentUserId?: string;
  isFinalQuestion?: boolean;
  hideTimer?: boolean;
  onTimerTick?: (remainingMs: number) => void;
}

/**
 * Accessible Live Question & High-Contrast Answer Grid (WCAG AA compliant)
 * High-contrast semantic states:
 * - Default: White background, 1.5px solid border (#CBD5E1), slate-900 text (#0F172A)
 * - User Missed: Background #FFF1F2 (rose-50), border #E11D48 (rose-600), text #881337 (rose-900), badge "✕ Your answer"
 * - Correct Revealed: Background #ECFDF5 (emerald-50), border #059669 (emerald-600), text #064E3B (emerald-950), badge "✓ Correct answer"
 * - Other Options: Dimmed with 50% opacity, standard readable dark text
 */
export function LiveQuestion({
  questionData,
  selectedOptionId,
  onSelect,
  roundReveal,
  currentUserId: _currentUserId,
  isFinalQuestion = false,
  hideTimer = false,
  onTimerTick,
}: LiveQuestionProps) {
  const { question } = questionData;
  const timeLimitMs = question.timeLimitMs || 15_000;

  const startedAtRef = useRef<number | null>(null);
  const [prevQuestionId, setPrevQuestionId] = useState(question.id);
  const [timeLeftMs, setTimeLeftMs] = useState(timeLimitMs);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Synchronize timer state during render when question changes
  if (prevQuestionId !== question.id) {
    setPrevQuestionId(question.id);
    setTimeLeftMs(timeLimitMs);
    setIsTimeUp(false);
  }

  // Timer interval effect (runs only while no reveal is active)
  useEffect(() => {
    if (roundReveal) return;

    startedAtRef.current = Date.now();

    const interval = setInterval(() => {
      const start = startedAtRef.current ?? Date.now();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      setTimeLeftMs(remaining);
      onTimerTick?.(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setIsTimeUp(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [question.id, timeLimitMs, roundReveal, onTimerTick]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (selectedOptionId || isTimeUp || roundReveal) return;
      const start = startedAtRef.current ?? Date.now();
      const timeTakenMs = Date.now() - start;
      onSelect(question.id, optionId, timeTakenMs);
    },
    [selectedOptionId, isTimeUp, roundReveal, question.id, onSelect]
  );

  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / timeLimitMs) * 100));
  const timeLeftSeconds = Math.ceil(timeLeftMs / 1000);
  const isUrgent = timeLeftSeconds <= 3;
  const isWarning = timeLeftSeconds <= 5 && !isUrgent;

  const isReveal = !!roundReveal;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Standalone Fallback Timer (Only shown if hideTimer is false) ── */}
      {!hideTimer && (
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface border-[2.5px] border-border shadow-[0_3px_0_#141827]">
          <div className="flex justify-between items-center text-xs font-black text-text-primary">
            <div className="flex items-center gap-1.5">
              <Clock
                size={14}
                className={
                  isUrgent
                    ? "text-rose-600 stroke-[2.5]"
                    : isWarning
                    ? "text-amber-600 stroke-[2.5]"
                    : "text-text-primary stroke-[2.5]"
                }
              />
              <span>Time Remaining</span>
              {isFinalQuestion && (
                <span className="ml-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-text-primary border-[1.5px] border-border shadow-[0_1px_0_#141827]">
                  FINAL QUESTION
                </span>
              )}
            </div>

            <span
              className={`font-black text-xs tabular-nums tracking-wide px-2.5 py-0.5 rounded-full border-[1.5px] border-border shadow-[0_1px_0_#141827] ${
                isUrgent
                  ? "bg-rose-100 text-rose-800"
                  : isWarning
                  ? "bg-primary text-text-primary"
                  : "bg-surface-muted text-text-primary"
              }`}
            >
              {timeLeftSeconds}s
            </span>
          </div>

          <div className="w-full h-2.5 bg-surface-muted border-[1.5px] border-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isUrgent
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-primary"
                  : "bg-text-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Question Card (Sharp-Bordered Cream Card) ── */}
      <div
        className={`p-5 sm:p-6 bg-surface border-[3px] border-border rounded-3xl shadow-[0_4px_0_#141827] transition-all ${
          isFinalQuestion
            ? "bg-primary/10"
            : ""
        }`}
      >
        {isFinalQuestion && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary border-[2px] border-border text-[10px] font-black uppercase tracking-wider text-text-primary shadow-[0_1.5px_0_#141827] mb-3">
            <span className="w-2 h-2 rounded-full bg-text-primary animate-pulse" />
            <span>Deciding Question</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-black text-text-primary leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* ── Accessible 2x2 Answer Grid (Solid Fills & Bold Black Borders) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = roundReveal ? roundReveal.correctOptionId === option.id : false;
          const isDisabled = !!selectedOptionId || isTimeUp || isReveal;

          const isUserMissed = isReveal && isSelected && !isCorrectOption;
          const isCorrectRevealed = isReveal && isCorrectOption;
          const isOtherOption = isReveal && !isSelected && !isCorrectOption;

          let buttonClasses = "";
          let badgeClasses = "";

          if (isUserMissed) {
            // User Missed: Crisp red fill, bold black border, sharp text
            buttonClasses =
              "bg-rose-100 border-[2.5px] border-border text-rose-950 shadow-[0_3px_0_#141827]";
            badgeClasses = "bg-rose-500 text-white border-[2px] border-border font-black";
          } else if (isCorrectRevealed) {
            // Correct Revealed: Crisp green fill, bold black border, sharp text
            buttonClasses =
              "bg-emerald-100 border-[2.5px] border-border text-emerald-950 shadow-[0_3px_0_#141827]";
            badgeClasses = "bg-emerald-500 text-white border-[2px] border-border font-black";
          } else if (isOtherOption) {
            // Other Options: Dimmed with 40% opacity
            buttonClasses =
              "opacity-40 bg-surface border-[2px] border-border/60 text-text-secondary shadow-none";
            badgeClasses =
              "bg-surface-muted border-[1.5px] border-border/60 text-text-secondary font-bold";
          } else if (isSelected) {
            // Pre-reveal selection locked state
            buttonClasses =
              "bg-primary/20 border-[2.5px] border-border text-text-primary shadow-[0_3px_0_#141827]";
            badgeClasses = "bg-primary text-text-primary border-[2px] border-border font-black";
          } else {
            // Default / Unselected: Solid white/cream fill, 2.5px black border, hard shadow
            buttonClasses =
              "bg-surface border-[2.5px] border-border text-text-primary hover:bg-surface-muted shadow-[0_3px_0_#141827]";
            badgeClasses =
              "bg-surface-muted border-[2px] border-border text-text-primary font-black";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isDisabled}
              aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option.text}`}
              className={`relative flex items-center gap-3 p-3.5 sm:p-4 min-h-[62px] rounded-2xl text-left text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonClasses} ${
                isDisabled && !isSelected && !isCorrectOption && !isReveal
                  ? "opacity-60 cursor-not-allowed"
                  : isReveal
                  ? "cursor-default"
                  : isSelected
                  ? "cursor-default"
                  : "cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5"
              }`}
            >
              {/* Option letter badge (A, B, C, D) */}
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors shadow-[0_1px_0_#141827] ${badgeClasses}`}
              >
                {String.fromCharCode(65 + idx)}
              </span>

              {/* Option text */}
              <span className="flex-1 leading-snug break-words">
                {option.text}
              </span>

              {/* Semantic Status Badges during Reveal */}
              {isUserMissed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-200 border-[1.5px] border-border text-rose-950 text-xs font-black shrink-0 shadow-[0_1px_0_#141827]">
                  ✕ Your answer
                </span>
              )}
              {isCorrectRevealed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-200 border-[1.5px] border-border text-emerald-950 text-xs font-black shrink-0 shadow-[0_1px_0_#141827]">
                  ✓ Correct answer
                </span>
              )}
              {!isReveal && isSelected && (
                <Check size={18} className="text-text-primary stroke-[3] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Pre-Reveal Feedback Indicators (Locked / Time Up) ── */}
      {selectedOptionId && !isReveal ? (
        <div className="p-3 bg-primary/20 border-[2px] border-border rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-text-primary shadow-[0_2px_0_#141827] animate-in fade-in duration-200">
          <Check size={15} className="text-text-primary stroke-[3]" />
          <span>Answer locked in — waiting for round reveal</span>
        </div>
      ) : isTimeUp && !selectedOptionId && !isReveal ? (
        <div className="p-3 bg-rose-100 border-[2px] border-border rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-rose-900 shadow-[0_2px_0_#141827] animate-in fade-in duration-200">
          <AlertCircle size={15} className="text-rose-700 stroke-[2.5]" />
          <span>Time is up! Round ending...</span>
        </div>
      ) : null}
    </div>
  );
}
