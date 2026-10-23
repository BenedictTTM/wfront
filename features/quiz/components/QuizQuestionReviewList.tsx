"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { ScoredAnswerDto } from "../types";
import { QuestionAiTutorModal } from "@/features/ai/components/QuestionAiTutorModal";
import type { QuestionContext } from "@/features/ai/prompts";

interface QuizQuestionReviewListProps {
  scoredAnswers: ScoredAnswerDto[];
}

export function QuizQuestionReviewList({ scoredAnswers }: QuizQuestionReviewListProps) {
  const [showReview, setShowReview] = useState(false);
  const [activeTutorContext, setActiveTutorContext] = useState<QuestionContext | null>(null);

  if (!scoredAnswers || scoredAnswers.length === 0) return null;

  return (
    <div className="w-full pt-4 border-t-[2px] border-border flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setShowReview(!showReview)}
        className="self-center px-4 py-2 border-[2px] border-border rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface flex items-center gap-2 cursor-pointer transition-all"
      >
        <span>
          {showReview ? "Hide Question Review" : "Review Questions & Explanations"}
        </span>
        {showReview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showReview && (
        <div className="flex flex-col gap-4 text-left">
          {scoredAnswers.map((ans, idx) => {
            const questionText =
              typeof ans.questionSnapshot?.text === "string"
                ? ans.questionSnapshot.text
                : `Question ${idx + 1}`;
            const explanation =
              typeof ans.questionSnapshot?.explanation === "string"
                ? ans.questionSnapshot.explanation
                : null;

            return (
              <div
                key={ans.questionId || idx}
                className={[
                  "p-4 border-[2px] rounded-xl flex flex-col gap-3",
                  ans.isCorrect
                    ? "bg-secondary/15 border-border"
                    : "bg-surface-muted border-border",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-extrabold text-xs md:text-sm text-text-primary">
                    {idx + 1}. {questionText}
                  </h5>
                  {ans.isCorrect ? (
                    <span className="flex items-center gap-1 text-text-primary text-xs font-black shrink-0">
                      <CheckCircle2 size={15} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-text-secondary text-xs font-black shrink-0">
                      <XCircle size={15} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="text-xs flex flex-col gap-1 bg-surface p-2.5 rounded-lg border-[2px] border-border-muted">
                  <div>
                    <span className="text-text-secondary font-bold">Your answer: </span>
                    <span
                      className={[
                        "font-black",
                        ans.isCorrect ? "text-text-primary" : "text-text-secondary",
                      ].join(" ")}
                    >
                      {ans.selectedOptionId || ans.submittedText || "No answer submitted"}
                    </span>
                  </div>
                  {!ans.isCorrect && ans.correctOption && (
                    <div>
                      <span className="text-text-secondary font-bold">Correct option: </span>
                      <span className="font-black text-text-primary">{ans.correctOption}</span>
                    </div>
                  )}
                </div>

                {explanation && (
                  <div className="p-3 bg-bg-primary border-[2px] border-border-muted rounded-lg text-xs">
                    <span className="font-black text-text-secondary block uppercase text-[10px] tracking-widest mb-1">
                      Explanation
                    </span>
                    <p className="text-text-primary font-medium leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                )}

                {/* Ask AI Tutor CTA */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTutorContext({
                        questionText,
                        options: (ans.questionSnapshot?.options as any) || [],
                        selectedOptionKey: ans.selectedOptionId,
                        submittedText: ans.submittedText,
                        correctOptionKey: ans.correctOption,
                        officialExplanation: explanation,
                      });
                    }}
                    className="px-3.5 py-1.5 bg-primary/20 hover:bg-primary border-[2px] border-border rounded-xl text-xs font-black text-text-primary flex items-center gap-1.5 shadow-[0_2px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="stroke-[2.5]" />
                    <span>Ask AI Tutor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive AI Tutor Modal */}
      {activeTutorContext && (
        <QuestionAiTutorModal
          isOpen={!!activeTutorContext}
          onClose={() => setActiveTutorContext(null)}
          context={activeTutorContext}
        />
      )}
    </div>
  );
}

