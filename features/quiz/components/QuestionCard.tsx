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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-black uppercase text-text-secondary tracking-widest">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {question.type && (
            <span className="px-3 py-1 border-[2px] border-border bg-surface text-text-primary text-[11px] font-black rounded-full uppercase tracking-wider shadow-[0_1.5px_0_#141827]">
              {question.type.replace("_", " ")}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-3 py-1 border-[2px] text-[11px] font-black rounded-full uppercase tracking-wider shadow-[0_1.5px_0_#141827] ${diffClass}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 md:p-6 bg-bg-secondary border-[3px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)]">
        <h4 className="font-black text-sm md:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
          {question.text}
        </h4>
      </div>
    </div>
  );
}
