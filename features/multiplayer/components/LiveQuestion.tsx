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
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white border border-slate-300 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Clock
                size={14}
                className={
                  isUrgent
                    ? "text-rose-600"
                    : isWarning
                    ? "text-amber-600"
                    : "text-slate-600"
                }
              />
              <span>Time Remaining</span>
              {isFinalQuestion && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
                  FINAL QUESTION
                </span>
              )}
            </div>

            <span
              className={`font-black text-sm tabular-nums tracking-wide px-2 py-0.5 rounded-md border ${
                isUrgent
                  ? "bg-rose-100 border-rose-300 text-rose-800"
                  : isWarning
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-slate-100 border-slate-300 text-slate-800"
              }`}
            >
              {timeLeftSeconds}s
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 border border-slate-300 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isUrgent
                  ? "bg-rose-600"
                  : isWarning
                  ? "bg-amber-500"
                  : "bg-slate-900"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Question Card (High Contrast & Clear Typography) ── */}
      <div
        className={`p-5 sm:p-6 bg-white border rounded-2xl shadow-sm transition-colors ${
          isFinalQuestion
            ? "border-amber-400 ring-2 ring-amber-400/30"
            : "border-slate-300"
        }`}
      >
        {isFinalQuestion && (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Deciding Question</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-bold text-[#0F172A] leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* ── Accessible 2x2 Answer Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
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
            // User Missed: Background #FFF1F2 (rose-50), border #E11D48 (rose-600), text #881337 (rose-900)
            buttonClasses =
              "bg-[#FFF1F2] border-2 border-[#E11D48] text-[#881337] shadow-sm";
            badgeClasses = "bg-[#E11D48] text-white border-[#E11D48] font-black";
          } else if (isCorrectRevealed) {
            // Correct Revealed: Background #ECFDF5 (emerald-50), border #059669 (emerald-600), text #064E3B (emerald-950)
            buttonClasses =
              "bg-[#ECFDF5] border-2 border-[#059669] text-[#064E3B] shadow-sm";
            badgeClasses = "bg-[#059669] text-white border-[#059669] font-black";
          } else if (isOtherOption) {
            // Other Options: Dimmed with 50% opacity, standard readable dark text
            buttonClasses =
              "opacity-50 bg-white border-[1.5px] border-[#CBD5E1] text-[#0F172A]";
            badgeClasses =
              "bg-slate-100 border border-slate-300 text-slate-700 font-bold";
          } else if (isSelected) {
            // Pre-reveal selection locked state
            buttonClasses =
              "bg-slate-100 border-2 border-slate-900 text-[#0F172A] ring-2 ring-slate-400/40 shadow-sm";
            badgeClasses = "bg-slate-900 text-white border-slate-900 font-black";
          } else {
            // Default / Unselected: White background, 1.5px border #CBD5E1, text #0F172A
            buttonClasses =
              "bg-white border-[1.5px] border-[#CBD5E1] text-[#0F172A] hover:border-slate-400 hover:bg-slate-50/80 shadow-sm";
            badgeClasses =
              "bg-slate-100 border border-slate-300 text-slate-700 font-bold";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isDisabled}
              aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option.text}`}
              className={`relative flex items-center gap-3 p-3.5 sm:p-4 min-h-[58px] rounded-xl text-left text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${buttonClasses} ${
                isDisabled && !isSelected && !isCorrectOption && !isReveal
                  ? "opacity-60 cursor-not-allowed"
                  : isReveal
                  ? "cursor-default"
                  : isSelected
                  ? "cursor-default"
                  : "cursor-pointer active:translate-y-0.5 hover:-translate-y-0.5"
              }`}
            >
              {/* Option letter badge (A, B, C, D) */}
              <span
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 transition-colors ${badgeClasses}`}
              >
                {String.fromCharCode(65 + idx)}
              </span>

              {/* Option text */}
              <span className="flex-1 leading-snug break-words">
                {option.text}
              </span>

              {/* Semantic Status Badges during Reveal */}
              {isUserMissed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-200/80 border border-rose-300 text-[#881337] text-xs font-black shrink-0">
                  ✕ Your answer
                </span>
              )}
              {isCorrectRevealed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200/80 border border-emerald-300 text-[#064E3B] text-xs font-black shrink-0">
                  ✓ Correct answer
                </span>
              )}
              {!isReveal && isSelected && (
                <Check size={18} className="text-[#0F172A] stroke-[3] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Pre-Reveal Feedback Indicators (Locked / Time Up) ── */}
      {selectedOptionId && !isReveal ? (
        <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-800 animate-in fade-in duration-200">
          <Check size={15} className="text-slate-900 stroke-[3]" />
          <span>Answer locked in — waiting for round reveal</span>
        </div>
      ) : isTimeUp && !selectedOptionId && !isReveal ? (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in duration-200">
          <AlertCircle size={15} className="text-rose-600 stroke-[2.5]" />
          <span>Time is up! Round ending...</span>
        </div>
      ) : null}
    </div>
  );
}
