"use client";

import React from "react";
import { BookOpen, Layers, HelpCircle, X, Sparkles } from "lucide-react";

interface StudyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtopicName: string;
  onSelectQuiz: () => void;
  onSelectFlashcards: () => void;
  onSelectSlides: () => void;
}

export function StudyModeModal({
  isOpen,
  onClose,
  subtopicName,
  onSelectQuiz,
  onSelectFlashcards,
  onSelectSlides,
}: StudyModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border-[3px] border-border rounded-3xl shadow-[0_8px_0_rgba(20,24,39,0.95)] p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl border-[2px] border-border bg-surface hover:bg-bg-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} className="text-text-primary stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-primary bg-primary/30 border border-border px-2.5 py-0.5 rounded-full w-fit flex items-center gap-1.5 shadow-[0_1px_0_#141827]">
            <Sparkles size={12} className="stroke-[2.5]" />
            Choose Your Study Mode
          </span>
          <h3 className="text-lg font-black text-text-primary leading-snug">
            {subtopicName}
          </h3>
        </div>

        {/* Options grid */}
        <div className="flex flex-col gap-3">
          {/* Top Row: Flashcards & Lecture Material side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Option: Flashcards */}
            <button
              type="button"
              onClick={onSelectFlashcards}
              className="p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:bg-secondary/20 transition-all text-left flex flex-col gap-2.5 group shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] cursor-pointer"
            >
              <div className="p-2.5 bg-secondary border-[2px] border-border rounded-xl text-text-primary font-black flex items-center justify-center w-fit shadow-[0_1.5px_0_#141827]">
                <Layers size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-black text-text-primary leading-tight">
                  Flashcards
                </span>
                <p className="text-[11px] text-text-secondary font-bold leading-snug line-clamp-2">
                  3D cards for key definitions &amp; formulas.
                </p>
              </div>
            </button>

            {/* Option: Lecture Material (Slides) */}
            <button
              type="button"
              onClick={onSelectSlides}
              className="p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:bg-primary/20 transition-all text-left flex flex-col gap-2.5 group shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] cursor-pointer"
            >
              <div className="p-2.5 bg-primary border-[2px] border-border rounded-xl text-text-primary font-black flex items-center justify-center w-fit shadow-[0_1.5px_0_#141827]">
                <BookOpen size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-black text-text-primary leading-tight">
                  Lecture Material
                </span>
                <p className="text-[11px] text-text-secondary font-bold leading-snug line-clamp-2">
                  Slide decks &amp; summary notes.
                </p>
              </div>
            </button>
          </div>

          {/* Bottom Row: Practice Quiz (Full width, beneath) */}
          <button
            type="button"
            onClick={onSelectQuiz}
            className="w-full p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:bg-primary/10 transition-all text-left flex items-center gap-3.5 group shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] cursor-pointer"
          >
            <div className="p-3 bg-primary border-[2px] border-border rounded-xl text-text-primary font-bold flex items-center justify-center shrink-0 shadow-[0_2px_0_#141827]">
              <HelpCircle size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-text-primary">
                  Practice Quiz
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-text-primary border border-border shadow-[0_1px_0_#141827]">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-text-secondary font-bold line-clamp-2">
                Test your knowledge with WASSCE questions, detailed explanations, and scoring.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
