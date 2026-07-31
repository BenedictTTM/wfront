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
  if (questionType === "SHORT_ANSWER" || (!options || options.length === 0)) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-secondary">
          Type your answer below:
        </label>
        <textarea
          value={submittedText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Enter answer text..."
          rows={3}
          className="w-full p-3.5 bg-surface border-2 border-border rounded-xl text-xs md:text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, idx) => {
        // Backend options are { key: "A" | "B" | ..., text: "..." }
        const optionKey = option.key || String.fromCharCode(65 + idx);
        const isSelected = selectedOptionId === optionKey;

        return (
          <button
            key={optionKey}
            type="button"
            onClick={() => onSelectOption(optionKey)}
            className={`w-full text-left p-3.5 border-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
              isSelected
                ? "bg-[#FFFDF6] dark:bg-amber-950/20 border-[#FF9E2C] text-[#FF9E2C] dark:text-amber-400 shadow-[0_2.5px_0_#FF9E2C]"
                : "bg-surface border-border hover:bg-bg-secondary text-text-primary"
            }`}
          >
            <span className="pr-4 leading-normal">{option.text}</span>
            <span
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                isSelected
                  ? "border-[#FF9E2C] bg-[#FF9E2C] text-white"
                  : "border-border text-text-secondary"
              }`}
            >
              {optionKey}
            </span>
          </button>
        );
      })}
    </div>
  );
}
