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
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {options.map((option, idx) => {
        const optionKey = option.key || String.fromCharCode(65 + idx);
        const isSelected = selectedOptionId === optionKey;
        const isCorrectTarget = feedback?.correctOption === optionKey;

        // Styling logic when immediate feedback is revealed
        let buttonStyles = "bg-surface border-border hover:bg-bg-primary shadow-[0_2px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] text-text-primary cursor-pointer";
        let badgeStyles = "border-border bg-bg-primary text-text-primary shadow-[0_1px_0_#141827]";
        let icon = null;

        if (isFeedbackRevealed) {
          if (isCorrectTarget) {
            buttonStyles = "bg-emerald-100 border-emerald-600 text-emerald-950 font-black shadow-[0_2px_0_#141827]";
            badgeStyles = "border-[1.5px] border-border bg-emerald-500 text-white font-black shadow-[0_1px_0_#141827]";
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />;
          } else if (isSelected && !feedback?.isCorrect) {
            buttonStyles = "bg-rose-100 border-rose-600 text-rose-950 font-black shadow-[0_2px_0_#141827]";
            badgeStyles = "border-[1.5px] border-border bg-rose-500 text-white font-black shadow-[0_1px_0_#141827]";
            icon = <XCircle className="w-4 h-4 text-rose-700 shrink-0 stroke-[2.5]" />;
          } else {
            buttonStyles = "bg-surface/50 border-border/40 opacity-40 text-text-secondary";
            badgeStyles = "border-[1px] border-border/40 bg-surface-muted text-text-secondary";
          }
        } else if (isSelected) {
          buttonStyles = "bg-[#fdf6d8] border-border shadow-[0_2.5px_0_rgba(20,24,39,0.9)] ring-2 ring-primary -translate-y-0.5 text-text-primary cursor-pointer";
          badgeStyles = "border-border bg-primary text-text-primary shadow-[0_1px_0_#141827]";
        }

        return (
          <button
            key={optionKey}
            type="button"
            disabled={isFeedbackRevealed}
            onClick={() => !isFeedbackRevealed && onSelectOption(optionKey)}
            className={[
              "w-full text-left p-2.5 sm:p-3 border-[2px] rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-between gap-2.5",
              buttonStyles,
            ].join(" ")}
          >
            <span className="leading-snug pr-2 flex items-center gap-2">
              {icon}
              {option.text}
            </span>
            <span
              className={[
                "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-[1.5px] flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-all",
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
