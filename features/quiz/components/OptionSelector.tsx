"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { QuestionOptionDto } from "../types";

interface OptionSelectorProps {
  options: QuestionOptionDto[];
  questionType?: string;
  selectedOptionId: string | null;
  submittedText: string;
  onSelectOption: (optionKey: string) => void;
  onChangeText: (text: string) => void;
  feedback?: {
    isCorrect?: boolean;
    correctOption?: string;
  } | null;
  isFeedbackRevealed?: boolean;
}

export function OptionSelector({
  options,
  questionType = "MCQ",
  selectedOptionId,
  submittedText,
  onSelectOption,
  onChangeText,
  feedback,
  isFeedbackRevealed = false,
}: OptionSelectorProps) {
  if (questionType === "SHORT_ANSWER" || !options || options.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-text-secondary">
          Your answer
        </label>
        <textarea
          value={submittedText}
          disabled={isFeedbackRevealed}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Write your answer here…"
          rows={3}
          className="w-full p-3.5 bg-bg-primary border-[2px] border-border rounded-xl text-xs md:text-sm font-bold text-text-primary focus:outline-none focus:border-border focus:ring-2 focus:ring-primary/40 transition-all resize-none disabled:opacity-75"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, idx) => {
        const optionKey = option.key || String.fromCharCode(65 + idx);
        const isSelected = selectedOptionId === optionKey;
        const isCorrectTarget = feedback?.correctOption === optionKey;

        // Styling logic when immediate feedback is revealed
        let buttonStyles = "bg-surface border-border hover:bg-bg-secondary text-text-primary cursor-pointer";
        let badgeStyles = "border-border-muted bg-surface-muted text-text-secondary";
        let icon = null;

        if (isFeedbackRevealed) {
          if (isCorrectTarget) {
            buttonStyles = "bg-emerald-500/15 border-emerald-600 text-emerald-950 dark:text-emerald-200 font-extrabold shadow-[0_3px_0_rgba(16,185,129,0.5)]";
            badgeStyles = "border-emerald-600 bg-emerald-500 text-white font-black";
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (isSelected && !feedback?.isCorrect) {
            buttonStyles = "bg-rose-500/15 border-rose-600 text-rose-950 dark:text-rose-200 font-extrabold line-through decoration-rose-500/60";
            badgeStyles = "border-rose-600 bg-rose-500 text-white font-black";
            icon = <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
          } else {
            buttonStyles = "bg-surface/60 border-border/60 opacity-50 text-text-muted";
            badgeStyles = "border-border/60 bg-surface-muted text-text-muted";
          }
        } else if (isSelected) {
          buttonStyles = "bg-primary/15 border-border shadow-[0_2.5px_0_rgba(20,24,39,0.9)] text-text-primary cursor-pointer";
          badgeStyles = "border-border bg-primary text-text-primary";
        }

        return (
          <button
            key={optionKey}
            type="button"
            disabled={isFeedbackRevealed}
            onClick={() => !isFeedbackRevealed && onSelectOption(optionKey)}
            className={[
              "w-full text-left p-3.5 border-[2px] rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between gap-3",
              buttonStyles,
            ].join(" ")}
          >
            <span className="leading-normal pr-2 flex items-center gap-2">
              {icon}
              {option.text}
            </span>
            <span
              className={[
                "w-7 h-7 rounded-full border-[2px] flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                badgeStyles,
              ].join(" ")}
            >
              {optionKey}
            </span>
          </button>
        );
      })}
    </div>
  );
}
