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
    <div className="flex flex-col gap-3">
      {options.map((option, idx) => {
        const optionKey = option.key || String.fromCharCode(65 + idx);
        const isSelected = selectedOptionId === optionKey;
        const isCorrectTarget = feedback?.correctOption === optionKey;

        // Styling logic when immediate feedback is revealed
        let buttonStyles = "bg-surface border-border hover:bg-bg-primary shadow-[0_3px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] text-text-primary cursor-pointer";
        let badgeStyles = "border-border bg-bg-primary text-text-primary shadow-[0_1px_0_#141827]";
        let icon = null;

        if (isFeedbackRevealed) {
          if (isCorrectTarget) {
            buttonStyles = "bg-emerald-500/20 border-emerald-700 text-emerald-950 dark:text-emerald-200 font-black shadow-[0_3px_0_rgba(4,120,87,0.7)]";
            badgeStyles = "border-border bg-emerald-500 text-white font-black shadow-[0_1px_0_#141827]";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" />;
          } else if (isSelected && !feedback?.isCorrect) {
            buttonStyles = "bg-rose-500/20 border-rose-700 text-rose-950 dark:text-rose-200 font-black line-through decoration-rose-700/70 shadow-[0_3px_0_rgba(190,18,60,0.7)]";
            badgeStyles = "border-border bg-rose-500 text-white font-black shadow-[0_1px_0_#141827]";
            icon = <XCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 stroke-[2.5]" />;
          } else {
            buttonStyles = "bg-surface/50 border-border/40 opacity-40 text-text-muted";
            badgeStyles = "border-border/40 bg-surface-muted text-text-muted";
          }
        } else if (isSelected) {
          buttonStyles = "bg-[#fdf6d8] border-border shadow-[0_4px_0_rgba(20,24,39,0.9)] ring-2 ring-primary -translate-y-0.5 text-text-primary cursor-pointer";
          badgeStyles = "border-border bg-primary text-text-primary shadow-[0_1.5px_0_#141827]";
        }

        return (
          <button
            key={optionKey}
            type="button"
            disabled={isFeedbackRevealed}
            onClick={() => !isFeedbackRevealed && onSelectOption(optionKey)}
            className={[
              "w-full text-left p-4 border-[2.5px] rounded-2xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-between gap-3",
              buttonStyles,
            ].join(" ")}
          >
            <span className="leading-normal pr-2 flex items-center gap-2.5">
              {icon}
              {option.text}
            </span>
            <span
              className={[
                "w-8 h-8 rounded-xl border-[2px] flex items-center justify-center text-xs font-black shrink-0 transition-all",
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
