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
          className="absolute top-4 right-4 p-2 rounded-xl border-[2px] border-border hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} className="text-text-secondary" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Sparkles size={12} />
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
              className="p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:border-secondary hover:bg-secondary/10 transition-all text-left flex flex-col gap-2.5 group shadow-[0_3px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 cursor-pointer"
            >
              <div className="p-2.5 bg-secondary/20 border-[2px] border-border rounded-xl group-hover:bg-secondary group-hover:text-text-primary transition-colors text-secondary font-bold flex items-center justify-center w-fit">
                <Layers size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-black text-text-primary leading-tight">
                  Flashcards
                </span>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                  3D cards for key definitions & formulas.
                </p>
              </div>
            </button>

            {/* Option: Lecture Material (Slides) */}
            <button
              type="button"
              onClick={onSelectSlides}
              className="p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:border-amber-500 hover:bg-amber-500/10 transition-all text-left flex flex-col gap-2.5 group shadow-[0_3px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 cursor-pointer"
            >
              <div className="p-2.5 bg-amber-500/20 border-[2px] border-border rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors text-amber-500 font-bold flex items-center justify-center w-fit">
                <BookOpen size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-black text-text-primary leading-tight">
                  Lecture Material
                </span>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                  Slide decks & summary notes.
                </p>
              </div>
            </button>
          </div>

          {/* Bottom Row: Practice Quiz (Full width, beneath) */}
          <button
            type="button"
            onClick={onSelectQuiz}
            className="w-full p-4 bg-surface border-[2.5px] border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-3.5 group shadow-[0_3px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 cursor-pointer"
          >
            <div className="p-3 bg-primary/20 border-[2px] border-border rounded-xl group-hover:bg-primary group-hover:text-text-primary transition-colors text-primary font-bold flex items-center justify-center shrink-0">
              <HelpCircle size={22} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-text-primary">
                  Practice Quiz
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">
                Test your knowledge with WASSCE questions, detailed explanations, and scoring.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
