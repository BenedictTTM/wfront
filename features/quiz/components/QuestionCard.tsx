"use client";

import React from "react";
import { AttemptQuestionDto } from "../types";

interface QuestionCardProps {
  question: AttemptQuestionDto;
  questionNumber: number;
  totalQuestions: number;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-secondary/30 text-text-primary border-border",
  MEDIUM: "bg-primary/20 text-text-primary border-border",
  HARD: "bg-text-primary/10 text-text-primary border-border",
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
            <span className="px-2.5 py-0.5 border-[2px] border-border bg-surface-muted text-text-secondary text-[11px] font-black rounded-full uppercase tracking-wide">
              {question.type.replace("_", " ")}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-2.5 py-0.5 border-[2px] text-[11px] font-black rounded-full uppercase tracking-wide ${diffClass}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 bg-bg-primary border-[2px] border-border rounded-xl shadow-[0_3px_0_rgba(20,24,39,0.9)]">
        <h4 className="font-extrabold text-sm md:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
          {question.text}
        </h4>
      </div>
    </div>
  );
}
