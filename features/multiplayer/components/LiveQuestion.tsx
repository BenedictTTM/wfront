"use client";
// features/multiplayer/components/LiveQuestion.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { WsQuestionStartEvent } from "../types";

interface LiveQuestionProps {
  questionData: WsQuestionStartEvent;
  selectedOptionId: string | null;
  onSelect: (questionId: string, optionId: string, timeTakenMs: number) => void;
}

const OPTION_COLORS = [
  { base: "bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30", selected: "bg-blue-600 border-blue-500" },
  { base: "bg-orange-600/20 border-orange-500/50 hover:bg-orange-600/30", selected: "bg-orange-500 border-orange-400" },
  { base: "bg-emerald-600/20 border-emerald-500/50 hover:bg-emerald-600/30", selected: "bg-emerald-600 border-emerald-500" },
  { base: "bg-violet-600/20 border-violet-500/50 hover:bg-violet-600/30", selected: "bg-violet-600 border-violet-500" },
];

export function LiveQuestion({ questionData, selectedOptionId, onSelect }: LiveQuestionProps) {
  const { question, questionIndex, totalQuestions } = questionData;
  const timeLimitMs = question.timeLimitMs;

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

  // Timer interval effect
  useEffect(() => {
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
  }, [question.id, timeLimitMs]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (selectedOptionId || isTimeUp) return;
      const start = startedAtRef.current ?? Date.now();
      const timeTakenMs = Date.now() - start;
      onSelect(question.id, optionId, timeTakenMs);
    },
    [selectedOptionId, isTimeUp, question.id, onSelect]
  );

  const progressPercent = (timeLeftMs / timeLimitMs) * 100;
  const timeLeftSeconds = Math.ceil(timeLeftMs / 1000);
  const isUrgent = timeLeftMs < 5000;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Timer bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-black">
          <span className="text-text-secondary">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span
            className={`tabular-nums transition-colors ${
              isUrgent ? "text-rose-500 animate-pulse" : "text-text-primary"
            }`}
          >
            {timeLeftSeconds}s
          </span>
        </div>
        <div className="w-full h-2 bg-surface-muted border border-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isUrgent ? "bg-rose-500" : progressPercent > 50 ? "bg-primary" : "bg-amber-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <div className="p-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)]">
        <p className="text-base font-bold text-text-primary leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const colors = OPTION_COLORS[idx % OPTION_COLORS.length];
          const isSelected = selectedOptionId === option.id;
          const isDisabled = !!selectedOptionId || isTimeUp;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isDisabled}
              className={`relative p-4 rounded-xl border-[2px] text-left text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary
                ${isSelected ? colors.selected + " text-white shadow-[0_2px_0_rgba(0,0,0,0.3)]" : colors.base + " text-text-primary"}
                ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
              `}
            >
              <span className="absolute top-3 left-3 w-5 h-5 rounded-md bg-black/20 flex items-center justify-center text-[10px] font-black">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="pl-7">{option.text}</span>
            </button>
          );
        })}
      </div>

      {selectedOptionId && (
        <p className="text-center text-xs font-black text-text-secondary animate-pulse">
          Answer locked in — waiting for opponent…
        </p>
      )}
      {isTimeUp && !selectedOptionId && (
        <p className="text-center text-xs font-black text-rose-500">
          Time&apos;s up!
        </p>
      )}
    </div>
  );
}
