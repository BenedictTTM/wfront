"use client";
// features/multiplayer/components/LiveQuestion.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Check, CheckCircle2, XCircle, AlertCircle, Zap, Flame } from "lucide-react";
import { WsQuestionStartEvent, RoundRevealData } from "../types";

interface LiveQuestionProps {
  questionData: WsQuestionStartEvent;
  selectedOptionId: string | null;
  onSelect: (questionId: string, optionId: string, timeTakenMs: number) => void;
  roundReveal?: RoundRevealData | null;
  currentUserId?: string;
  isFinalQuestion?: boolean;
}

const OPTION_THEMES = [
  {
    base: "bg-surface hover:bg-surface-muted/80 border-border text-text-primary",
    selected: "bg-primary text-text-primary border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] ring-2 ring-primary/60",
    badge: "bg-surface-muted border-border text-text-secondary",
    badgeSelected: "bg-surface border-border text-text-primary",
  },
  {
    base: "bg-surface hover:bg-surface-muted/80 border-border text-text-primary",
    selected: "bg-primary text-text-primary border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] ring-2 ring-primary/60",
    badge: "bg-surface-muted border-border text-text-secondary",
    badgeSelected: "bg-surface border-border text-text-primary",
  },
  {
    base: "bg-surface hover:bg-surface-muted/80 border-border text-text-primary",
    selected: "bg-primary text-text-primary border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] ring-2 ring-primary/60",
    badge: "bg-surface-muted border-border text-text-secondary",
    badgeSelected: "bg-surface border-border text-text-primary",
  },
  {
    base: "bg-surface hover:bg-surface-muted/80 border-border text-text-primary",
    selected: "bg-primary text-text-primary border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] ring-2 ring-primary/60",
    badge: "bg-surface-muted border-border text-text-secondary",
    badgeSelected: "bg-surface border-border text-text-primary",
  },
];

export function LiveQuestion({
  questionData,
  selectedOptionId,
  onSelect,
  roundReveal,
  currentUserId,
  isFinalQuestion = false,
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
      if (remaining === 0) {
        clearInterval(interval);
        setIsTimeUp(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [question.id, timeLimitMs, roundReveal]);

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
  const myResult = roundReveal?.results.find((r) => r.participantId === currentUserId);
  const correctOptionText =
    question.options.find((o) => o.id === roundReveal?.correctOptionId)?.text ?? "";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Timer Header & Bar ── */}
      <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface border-[2px] border-border shadow-[0_2px_0_rgba(20,24,39,0.9)]">
        <div className="flex justify-between items-center text-xs">
          {isReveal ? (
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              {myResult?.isCorrect ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-black">
                    Round Evaluation Complete
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-surface-muted border border-border shrink-0" />
                  <span className="text-text-secondary font-black">
                    Round Evaluation Complete
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-text-secondary">
              <Clock
                size={14}
                className={
                  isUrgent
                    ? "text-rose-500"
                    : isWarning
                    ? "text-amber-500"
                    : isFinalQuestion
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-text-secondary"
                }
              />
              <span>Time Remaining</span>
              {isFinalQuestion && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/50 animate-in fade-in duration-300">
                  FINAL QUESTION
                </span>
              )}
            </div>
          )}

          {isReveal ? (
            <span
              className={`font-black text-xs px-2 py-0.5 rounded-md border ${
                myResult?.isCorrect
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                  : "bg-surface-muted border-border/40 text-text-secondary"
              }`}
            >
              {myResult?.isCorrect ? `+${myResult.pointsEarned} pts` : "+0 pts"}
            </span>
          ) : (
            <span
              className={`font-black text-sm tabular-nums tracking-wide px-2 py-0.5 rounded-md border ${
                isUrgent
                  ? "bg-rose-500/10 border-rose-500 text-rose-600 animate-pulse motion-reduce:animate-none"
                  : isWarning
                  ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300"
                  : "bg-surface-muted border-border/40 text-text-primary"
              }`}
            >
              {timeLeftSeconds}s
            </span>
          )}
        </div>

        {/* Dynamic Timer Track */}
        <div className="w-full h-2.5 bg-surface-muted border border-border/40 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-75 motion-reduce:transition-none ${
              isReveal
                ? myResult?.isCorrect
                  ? "bg-emerald-500 w-full"
                  : "bg-border w-full"
                : isUrgent
                ? "bg-rose-500"
                : isWarning
                ? "bg-amber-500"
                : "bg-primary"
            }`}
            style={{ width: isReveal ? "100%" : `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div
        className={`p-5 sm:p-6 bg-surface border-[2px] rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] transition-colors ${
          isFinalQuestion
            ? "border-amber-500/50 ring-1 ring-amber-500/25"
            : "border-border"
        }`}
      >
        {isFinalQuestion && (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
            <span>Deciding Question</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-bold text-text-primary leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* ── Answer Options Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {question.options.map((option, idx) => {
          const theme = OPTION_THEMES[idx % OPTION_THEMES.length];
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = roundReveal ? roundReveal.correctOptionId === option.id : false;
          const isDisabled = !!selectedOptionId || isTimeUp || isReveal;

          let buttonStyle = `${theme.base} shadow-[0_2px_0_rgba(20,24,39,0.9)]`;
          let badgeStyle = theme.badge;

          if (isReveal) {
            if (isSelected && isCorrectOption) {
              // User selected correct answer
              buttonStyle =
                "bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/40 shadow-[0_2px_0_rgba(16,185,129,0.3)]";
              badgeStyle = "bg-emerald-600 text-white border-emerald-600";
            } else if (isSelected && !isCorrectOption) {
              // User selected wrong answer
              buttonStyle =
                "bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/40 shadow-[0_2px_0_rgba(244,63,94,0.2)]";
              badgeStyle = "bg-rose-500 text-white border-rose-500";
            } else if (!isSelected && isCorrectOption) {
              // Correct answer that user didn't pick
              buttonStyle =
                "bg-emerald-500/10 border-emerald-500/80 text-emerald-900 dark:text-emerald-100 shadow-[0_2px_0_rgba(16,185,129,0.2)]";
              badgeStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/60";
            } else {
              // Other unselected, incorrect options
              buttonStyle = "opacity-35 bg-surface-muted/40 border-border/40 text-text-secondary";
              badgeStyle = "bg-surface-muted border-border text-text-secondary";
            }
          } else if (isSelected) {
            buttonStyle = theme.selected;
            badgeStyle = theme.badgeSelected;
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isDisabled}
              className={`relative flex items-center gap-3 p-3.5 sm:p-4 min-h-[56px] rounded-xl border-[2px] text-left text-sm font-bold transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonStyle} ${
                isDisabled && !isSelected && !isCorrectOption && !isReveal
                  ? "opacity-50 cursor-not-allowed"
                  : isReveal
                  ? "cursor-default"
                  : isSelected
                  ? "cursor-default"
                  : "cursor-pointer active:translate-y-0.5 hover:-translate-y-0.5"
              }`}
            >
              {/* Option letter badge (A, B, C, D) */}
              <span
                className={`w-6 h-6 rounded-md border-[1.5px] flex items-center justify-center text-xs font-black shrink-0 transition-colors ${badgeStyle}`}
              >
                {String.fromCharCode(65 + idx)}
              </span>

              {/* Option text */}
              <span className="flex-1 leading-snug break-words">
                {option.text}
              </span>

              {/* Reveal indicators */}
              {isReveal ? (
                isSelected && isCorrectOption ? (
                  <div className="flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                    <CheckCircle2 size={18} className="stroke-[2.5]" />
                    <span className="hidden sm:inline">Your answer</span>
                  </div>
                ) : isSelected && !isCorrectOption ? (
                  <div className="flex items-center gap-1 text-xs font-black text-rose-700 dark:text-rose-300 shrink-0">
                    <XCircle size={18} className="stroke-[2.5]" />
                    <span className="hidden sm:inline">Your answer</span>
                  </div>
                ) : isCorrectOption ? (
                  <div className="flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                    <Check size={16} className="stroke-[2.5]" />
                    <span className="text-[11px]">Correct answer</span>
                  </div>
                ) : null
              ) : (
                /* Pre-reveal checkmark when locked */
                isSelected && (
                  <Check size={18} className="text-text-primary stroke-[3] shrink-0" />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* ── Dynamic Answer & Round Feedback ── */}
      {isReveal && myResult ? (
        myResult.isCorrect ? (
          /* CORRECT: Concise positive feedback */
          <div className="p-4 rounded-2xl bg-emerald-500/10 border-[2px] border-emerald-600/50 shadow-[0_3px_0_rgba(16,185,129,0.25)] flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                    Correct Answer!
                  </span>
                  <span className="block text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                    Points awarded for accuracy and speed
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                  +{myResult.pointsEarned}
                </span>
                <span className="block text-[9px] font-bold text-text-secondary uppercase">pts</span>
              </div>
            </div>

            {/* Speed & Streak Chips */}
            {(myResult.speedBonus > 0 || myResult.streakBonus > 0) && (
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-600/20">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  Bonus:
                </span>
                {myResult.speedBonus > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-emerald-600/30 text-[10px] font-bold text-text-primary">
                    <Zap size={11} className="text-primary" />
                    +{myResult.speedBonus} speed
                  </span>
                )}
                {myResult.streakBonus > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-amber-600/30 text-[10px] font-bold text-text-primary">
                    <Flame size={11} className="text-amber-500" />
                    +{myResult.streakBonus} streak ({myResult.newStreak} in a row)
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* INCORRECT: Calm, non-punishing feedback revealing correct answer */
          <div className="p-4 rounded-2xl bg-surface border-[2px] border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-600 shrink-0">
                {selectedOptionId === "__TIMEOUT__" || !selectedOptionId ? (
                  <Clock size={18} className="stroke-[2.5]" />
                ) : (
                  <XCircle size={18} className="stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-black text-text-primary">
                  {selectedOptionId === "__TIMEOUT__" || !selectedOptionId ? "Time expired" : "Incorrect"}
                </span>
                <span className="block text-xs font-medium text-text-secondary truncate">
                  {correctOptionText ? (
                    <>
                      Correct answer:{" "}
                      <span className="font-bold text-text-primary">{correctOptionText}</span>
                    </>
                  ) : (
                    "No points awarded this round"
                  )}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-black text-text-secondary tabular-nums">+0</span>
              <span className="block text-[9px] font-bold text-text-secondary uppercase">pts</span>
            </div>
          </div>
        )
      ) : selectedOptionId ? (
        <div className="p-3 bg-primary/15 border-[2px] border-primary/50 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-text-primary">
          <Check size={15} className="text-text-primary stroke-[3]" />
          <span>Answer locked in — waiting for round reveal</span>
        </div>
      ) : isTimeUp ? (
        <div className="p-3 bg-rose-500/10 border-[2px] border-rose-500/40 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-rose-600">
          <AlertCircle size={15} className="text-rose-500 stroke-[2.5]" />
          <span>Time is up! Round ending...</span>
        </div>
      ) : null}

      {/* Next question indicator during reveal */}
      {isReveal && (
        <p className="text-center text-xs text-text-secondary font-bold animate-in fade-in duration-300">
          {isFinalQuestion
            ? "Match complete — calculating final results…"
            : "Next question starting shortly…"}
        </p>
      )}
    </div>
  );
}
