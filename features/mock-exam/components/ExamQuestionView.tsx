"use client";

// features/mock-exam/components/ExamQuestionView.tsx
// Full exam-mode question + options + navigation.
// Rendered during ACTIVE_EXAM phase under LockIn™ monitoring.

import React from "react";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { LockInBadge } from "./LockInBadge";
import { MockExamAttempt, AnswersMap } from "../types";

// Question/option types reused from QuizAttempt shape
type QuestionOption = { key: string; text: string };
type ExamQuestion = {
  id: string;
  text: string;
  options: QuestionOption[];
  type: string;
  difficulty: string;
};

interface ExamQuestionViewProps {
  exam: MockExamAttempt;
  questions: ExamQuestion[];
  currentIndex: number;
  answersMap: AnswersMap;
  secondsRemaining: number;
  isLockInActive: boolean;
  gracePeriodRemaining: number | null;
  isSubmitting: boolean;
  onSelectOption: (questionId: string, optionKey: string) => void;
  onChangeText: (questionId: string, text: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamQuestionView({
  exam,
  questions,
  currentIndex,
  answersMap,
  secondsRemaining,
  isLockInActive,
  gracePeriodRemaining,
  isSubmitting,
  onSelectOption,
  onChangeText,
  onPrev,
  onNext,
  onSubmit,
}: ExamQuestionViewProps) {
  const question = questions[currentIndex];
  const activeAnswer = question ? answersMap[question.id] : undefined;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answersMap).filter(
    (qId) =>
      answersMap[qId]?.selectedOptionId || answersMap[qId]?.submittedText?.trim(),
  ).length;

  const timeIsLow = secondsRemaining < 300; // under 5 min
  const timeIsCritical = secondsRemaining < 60; // under 1 min

  if (!question) return null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-0 animate-in fade-in duration-150">
      {/* ── Exam Header Bar ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-[#141827] rounded-t-2xl border-2 border-[#141827]"
        style={{ borderBottom: "none" }}
      >
        <div className="flex items-center gap-3">
          {/* Subject/exam label */}
          <span className="text-xs font-black uppercase tracking-widest text-white/50">
            WASSCE Simulation
          </span>
          <LockInBadge
            isActive={isLockInActive}
            gracePeriodRemaining={gracePeriodRemaining}
          />
        </div>

        {/* Server-authoritative countdown timer */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-black text-sm tabular-nums transition-all duration-500"
          style={{
            background: timeIsCritical
              ? "rgba(239,68,68,0.15)"
              : timeIsLow
              ? "rgba(245,158,11,0.12)"
              : "rgba(255,255,255,0.06)",
            borderColor: timeIsCritical
              ? "rgba(239,68,68,0.4)"
              : timeIsLow
              ? "rgba(245,158,11,0.3)"
              : "rgba(255,255,255,0.12)",
            color: timeIsCritical ? "#ef4444" : timeIsLow ? "#f59e0b" : "white",
          }}
        >
          <span>{formatTime(secondsRemaining)}</span>
        </div>
      </div>

      {/* ── Progress Bar ────────────────────────────────────────────────── */}
      <div
        className="w-full h-1.5 bg-white/5"
        style={{ borderLeft: "2px solid #141827", borderRight: "2px solid #141827" }}
      >
        <div
          className="h-full bg-[#F6D86B] transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ── Question Body ────────────────────────────────────────────────── */}
      <div className="bg-white border-x-2 border-[#141827] px-6 py-6 flex flex-col gap-5">
        {/* Question meta */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#5C6470]">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-bold text-[#5C6470]">
            {answeredCount} answered
          </span>
        </div>

        {/* Question text */}
        <div className="p-5 bg-[#F5F1E8] border-2 border-[#141827]/10 rounded-xl">
          <p className="font-bold text-sm md:text-base text-[#141827] leading-relaxed whitespace-pre-wrap">
            {question.text}
          </p>
        </div>

        {/* Options */}
        {question.type?.toUpperCase() === "SHORT_ANSWER" ? (
          <textarea
            className="w-full p-4 border-2 border-[#141827] rounded-xl text-sm font-medium text-[#141827] bg-white placeholder:text-[#5C6470]/50 resize-none focus:outline-none focus:border-[#141827] focus:ring-2 focus:ring-[#F6D86B]/50 transition-all"
            rows={4}
            placeholder="Type your answer here..."
            value={activeAnswer?.submittedText || ""}
            onChange={(e) => onChangeText(question.id, e.target.value)}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {question.options?.map((option) => {
              const isSelected = activeAnswer?.selectedOptionId === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onSelectOption(question.id, option.key)}
                  className="flex items-start gap-4 w-full p-4 border-2 rounded-xl font-medium text-sm text-left transition-all duration-150 cursor-pointer"
                  style={{
                    borderColor: isSelected ? "#141827" : "#141827/10",
                    background: isSelected ? "#141827" : "white",
                    color: isSelected ? "white" : "#141827",
                    boxShadow: isSelected ? "0 3px 0 rgba(0,0,0,0.5)" : "none",
                    transform: isSelected ? "translateY(-1px)" : "none",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border-2 transition-all"
                    style={{
                      borderColor: isSelected ? "rgba(255,255,255,0.3)" : "#141827",
                      background: isSelected ? "rgba(255,255,255,0.15)" : "#F5F1E8",
                      color: isSelected ? "white" : "#141827",
                    }}
                  >
                    {option.key}
                  </span>
                  <span className="flex-1 leading-relaxed pt-0.5">{option.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 bg-[#F5F1E8] border-2 border-t-0 border-[#141827] rounded-b-2xl"
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0 || isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#141827] rounded-xl font-bold text-xs text-[#141827] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Previous
        </button>

        {/* Question navigation dots (up to 15 shown) */}
        <div className="hidden md:flex items-center gap-1">
          {questions.slice(0, 15).map((q, i) => {
            const answered = !!(answersMap[q.id]?.selectedOptionId || answersMap[q.id]?.submittedText?.trim());
            const isCurrent = i === currentIndex;
            return (
              <div
                key={q.id}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  background: isCurrent
                    ? "#141827"
                    : answered
                    ? "#F6D86B"
                    : "#D8D8D8",
                  transform: isCurrent ? "scale(1.4)" : "scale(1)",
                }}
              />
            );
          })}
          {questions.length > 15 && (
            <span className="text-[10px] text-[#5C6470] font-bold ml-1">
              +{questions.length - 15}
            </span>
          )}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#141827] text-white border-2 border-[#141827] rounded-xl font-black text-xs shadow-[0_3px_0_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_0.5px_0_rgba(0,0,0,0.4)] transition-all cursor-pointer"
          >
            Next
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#22c55e] text-white border-2 border-[#16a34a] rounded-xl font-black text-xs shadow-[0_3px_0_#15803d] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_0.5px_0_#15803d] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Submit Exam
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
