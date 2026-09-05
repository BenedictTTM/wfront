"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Layers,
  RotateCcw,
} from "lucide-react";

export interface SlideItem {
  id: string;
  title: string;
  tag: string;
  content: string[];
  keyTakeaway?: string;
  examTip?: string;
  formulaOrQuote?: string;
}

interface LectureSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtopicName: string;
  subjectName: string;
  subtopicId: string;
  subjectId: string;
  onStartQuiz: () => void;
  onStartFlashcards: () => void;
}

function generateSubtopicSlides(subtopicName: string, subjectName: string): SlideItem[] {
  return [
    {
      id: "slide-1",
      title: `Introduction to ${subtopicName}`,
      tag: "OVERVIEW & DEFINITION",
      content: [
        `${subtopicName} is a fundamental topic in ${subjectName} essential for WASSCE mastery.`,
        "Understanding core definitions, structural relationships, and underlying principles is key.",
        "Examiners frequently test both theoretical definitions and direct application scenarios in Section A and B."
      ],
      keyTakeaway: "Mastering the foundational definitions makes answering multi-step questions significantly easier.",
      examTip: "Look out for keywords in WASSCE questions such as 'Define', 'Explain', and 'State two differences'.",
    },
    {
      id: "slide-2",
      title: "Core Concepts & Principles",
      tag: "KEY MECHANISMS",
      content: [
        "Primary components work together within a systematic framework to produce defined outcomes.",
        "Key relationships must be understood in sequence rather than isolated facts.",
        "Systematic classification helps distinguish between closely related terms in this topic."
      ],
      formulaOrQuote: `Core Law of ${subtopicName}: Input conditions determine state transitions and output efficiency.`,
      keyTakeaway: "Always relate sub-processes back to the primary function of the system.",
    },
    {
      id: "slide-3",
      title: "Detailed Breakdown & Applications",
      tag: "PRACTICAL ANALYSIS",
      content: [
        "Real-world application questions test your ability to apply theory to practical scenarios.",
        "Step 1: Identify given parameters and constraints in the problem statement.",
        "Step 2: Apply standard rules, equations, or structural diagrams to derive the solution.",
        "Step 3: Verify units, logical consistency, and completeness of your final answer."
      ],
      examTip: "In WASSCE theory papers, showing clear step-by-step working yields partial credit even if final numerical calculation has minor arithmetic errors.",
    },
    {
      id: "slide-4",
      title: "Common WASSCE Pitfalls & Strategy",
      tag: "EXAM TACTICS",
      content: [
        "Avoid confusing terminology with related but distinct topics.",
        "Ensure diagrams are clearly labeled with appropriate standard symbols where required.",
        "Manage time effectively by answering straightforward definition questions before complex analytical problems."
      ],
      keyTakeaway: "Precision in terminology marks the difference between average and distinction grades.",
      examTip: "Double check units and ensure labeled diagrams are drawn with crisp pencil lines.",
    },
    {
      id: "slide-5",
      title: "Summary & Next Steps",
      tag: "RECAP & MASTERY",
      content: [
        `You have completed the lecture material for ${subtopicName}.`,
        "Consolidate your learning by testing yourself with practice questions or reviewing key flashcards.",
        "Target scoring above 80% on practice quizzes before moving to the next chapter."
      ],
      keyTakeaway: "Immediate active retrieval through quizzes locks concepts into long-term memory.",
    },
  ];
}

export function LectureSlidesModal({
  isOpen,
  onClose,
  subtopicName,
  subjectName,
  onStartQuiz,
  onStartFlashcards,
}: LectureSlidesModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = generateSubtopicSlides(subtopicName, subjectName);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const progressPct = ((currentSlideIndex + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] bg-surface border-[3px] border-border rounded-3xl shadow-[0_8px_0_rgba(20,24,39,0.95)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 border-b-[2px] border-border flex items-center justify-between gap-3 bg-surface-muted/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/30 shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary truncate">
                {subjectName} · Slides
              </span>
              <h4 className="text-xs sm:text-sm font-black text-text-primary truncate">
                {subtopicName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-black text-text-secondary">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border-[2px] border-border hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Close slides"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-muted border-b border-border/40">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Slide Content Area */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            {/* Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {currentSlide.tag}
              </span>
              <span className="text-[11px] font-medium text-text-secondary hidden sm:inline">
                Use ← → keys to navigate
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-black text-text-primary leading-tight">
              {currentSlide.title}
            </h3>

            {/* Main Content List */}
            <ul className="flex flex-col gap-3 py-1">
              {currentSlide.content.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-primary leading-relaxed font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Formula / Highlight Box */}
            {currentSlide.formulaOrQuote && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border-[2px] border-amber-500/30 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                <Sparkles size={18} className="shrink-0 mt-0.5 text-amber-500" />
                <span>{currentSlide.formulaOrQuote}</span>
              </div>
            )}

            {/* Key Takeaway Box */}
            {currentSlide.keyTakeaway && (
              <div className="p-3.5 rounded-2xl bg-primary/10 border-[2px] border-primary/30 text-xs sm:text-sm font-semibold text-text-primary flex items-start gap-2.5">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-primary" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block text-primary mb-0.5">
                    Key Takeaway
                  </span>
                  <span>{currentSlide.keyTakeaway}</span>
                </div>
              </div>
            )}

            {/* Exam Tip Box */}
            {currentSlide.examTip && (
              <div className="p-3.5 rounded-2xl bg-secondary/15 border-[2px] border-border text-xs sm:text-sm font-semibold text-text-primary flex items-start gap-2.5">
                <Lightbulb size={18} className="shrink-0 mt-0.5 text-secondary" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block text-secondary mb-0.5">
                    WASSCE Exam Tip
                  </span>
                  <span>{currentSlide.examTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* End of slides action box */}
          {isLastSlide && (
            <div className="p-4 rounded-2xl bg-surface-muted border-[2px] border-border flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-xs font-black text-text-primary">
                  Lecture Material Completed! 🎉
                </span>
                <span className="text-[11px] text-text-secondary">
                  Ready to test your comprehension?
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onStartFlashcards}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-secondary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers size={14} />
                  Flashcards
                </button>
                <button
                  type="button"
                  onClick={onStartQuiz}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle size={14} />
                  Practice Quiz
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t-[2px] border-border flex items-center justify-between bg-surface-muted/30">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 border-[2px] border-border rounded-xl text-xs font-black flex items-center gap-1 hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
            PREVIOUS
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlideIndex(0)}
            className="p-2 border-[2px] border-border rounded-xl text-xs font-black hover:bg-surface-muted transition-all cursor-pointer hidden sm:flex items-center gap-1 text-text-secondary"
            title="Restart slides"
          >
            <RotateCcw size={14} />
          </button>

          {!isLastSlide ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-amber-500 text-slate-950 border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
            >
              NEXT SLIDE
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartQuiz}
              className="px-5 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              START QUIZ
              <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
