"use client";

import React from "react";
import { AttemptQuestionDto } from "../types";

interface QuestionCardProps {
  question: AttemptQuestionDto;
  questionNumber: number;
  totalQuestions: number;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-secondary text-text-primary border-border",
  MEDIUM: "bg-primary text-text-primary border-border",
  HARD: "bg-rose-200 text-rose-950 border-border",
};

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  const diffClass =
    DIFFICULTY_STYLES[(question.difficulty ?? "MEDIUM").toUpperCase()] ??
    DIFFICULTY_STYLES.MEDIUM;

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] font-black uppercase text-text-secondary tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-1.5">
          {question.type && (
            <span className="px-2.5 py-0.5 border-[1.5px] border-border bg-surface text-text-primary text-[10px] font-black rounded-full uppercase tracking-wider shadow-[0_1px_0_#141827]">
              {question.type.replace("_", " ")}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-2.5 py-0.5 border-[1.5px] text-[10px] font-black rounded-full uppercase tracking-wider shadow-[0_1px_0_#141827] ${diffClass}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-4 bg-bg-secondary border-[2px] border-border rounded-xl shadow-[0_2.5px_0_rgba(20,24,39,0.9)]">
        <h4 className="font-black text-xs sm:text-sm text-text-primary leading-snug whitespace-pre-wrap">
          {question.text}
        </h4>
      </div>
    </div>
  );
}
