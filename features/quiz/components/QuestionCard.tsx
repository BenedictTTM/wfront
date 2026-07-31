"use client";

import React from "react";
import { AttemptQuestionDto } from "../types";

interface QuestionCardProps {
  question: AttemptQuestionDto;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "HARD":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "MEDIUM":
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-text-secondary tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {question.type && (
            <span className="px-2.5 py-0.5 border border-border bg-surface-muted text-text-secondary text-[11px] font-bold rounded-full uppercase">
              {question.type.replace("_", " ")}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-2.5 py-0.5 border text-[11px] font-bold rounded-full uppercase ${getDifficultyBadge(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 bg-bg-primary border-2 border-border rounded-xl">
        <h4 className="font-extrabold text-sm md:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
          {question.text}
        </h4>
      </div>
    </div>
  );
}
