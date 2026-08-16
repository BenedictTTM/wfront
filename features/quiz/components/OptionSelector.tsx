"use client";

import React from "react";
import { QuestionOptionDto } from "../types";

interface OptionSelectorProps {
  options: QuestionOptionDto[];
  questionType?: string;
  selectedOptionId: string | null;
  submittedText: string;
  onSelectOption: (optionKey: string) => void;
  onChangeText: (text: string) => void;
}

export function OptionSelector({
  options,
  questionType = "MCQ",
  selectedOptionId,
  submittedText,
  onSelectOption,
  onChangeText,
}: OptionSelectorProps) {
  if (questionType === "SHORT_ANSWER" || !options || options.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-text-secondary">
          Your answer
        </label>
        <textarea
          value={submittedText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Write your answer here…"
          rows={3}
          className="w-full p-3.5 bg-bg-primary border-[2px] border-border rounded-xl text-xs md:text-sm font-bold text-text-primary focus:outline-none focus:border-border focus:ring-2 focus:ring-primary/40 transition-all resize-none"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, idx) => {
        const optionKey = option.key || String.fromCharCode(65 + idx);
        const isSelected = selectedOptionId === optionKey;

        return (
          <button
            key={optionKey}
            type="button"
            onClick={() => onSelectOption(optionKey)}
            className={[
              "w-full text-left p-3.5 border-[2px] rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between gap-3 cursor-pointer",
              isSelected
                ? "bg-primary/15 border-border shadow-[0_2.5px_0_rgba(20,24,39,0.9)] text-text-primary"
                : "bg-surface border-border hover:bg-bg-secondary text-text-primary",
            ].join(" ")}
          >
            <span className="leading-normal pr-2">{option.text}</span>
            <span
              className={[
                "w-7 h-7 rounded-full border-[2px] flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                isSelected
                  ? "border-border bg-primary text-text-primary"
                  : "border-border-muted bg-surface-muted text-text-secondary",
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
