"use client";

import React, { useState } from "react";
import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { SubmitAttemptResponseDto } from "../types";

interface QuizResultsScreenProps {
  results: SubmitAttemptResponseDto;
  onReset: () => void;
}

export function QuizResultsScreen({ results, onReset }: QuizResultsScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = results.scoredAnswers?.length || 0;
  const correctAnswersCount = results.scoredAnswers?.filter((a) => a.isCorrect).length || 0;

  const isPassed = results.score >= 50;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Header icon / badge */}
      <div className="relative">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-offset ${
            isPassed
              ? "bg-amber-400/20 border-amber-500 text-amber-500"
              : "bg-surface-muted border-border text-text-secondary"
          }`}
        >
          <Trophy className="w-10 h-10" />
        </div>
        {results.isFirstAttempt && (
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-primary border-2 border-border text-[10px] font-black rounded-full shadow-sm uppercase">
            1st Try!
          </span>
        )}
      </div>

      {/* Main Score Headline */}
      <div className="flex flex-col gap-1">
        <h4 className="text-2xl font-black text-text-primary">
          {isPassed ? "Great Job!" : "Practice Session Complete"}
        </h4>
        <p className="text-sm font-extrabold text-text-secondary">
          You scored <span className="text-text-primary font-black">{results.score}%</span> (
          {correctAnswersCount} / {totalQuestions} correct)
        </p>
      </div>

      {/* Rewards breakdown card */}
      <div className="bg-[#FFFDF6] dark:bg-amber-950/20 border-2 border-border p-4 rounded-xl max-w-md flex flex-col gap-2.5 w-full text-xs font-bold shadow-sm">
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Zap size={14} className="fill-amber-500 text-amber-500" />
            <span>XP Earned:</span>
          </span>
          <span className="text-[#FF9E2C] font-black text-sm">+{results.xpAwarded} XP</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Attempt Mode:</span>
          <span className="font-extrabold text-text-primary">{results.mode}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md pt-2">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 border-2 border-border bg-surface rounded-xl text-xs font-bold hover:bg-surface-muted transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>TAKE ANOTHER QUIZ</span>
        </button>
        <Link
          href="/study"
          className="px-5 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>RETURN TO STUDY</span>
        </Link>
      </div>

      {/* Review Questions Toggle */}
      {results.scoredAnswers && results.scoredAnswers.length > 0 && (
        <div className="w-full pt-4 border-t-2 border-border flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="self-center px-4 py-2 border-2 border-border rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>{showReview ? "Hide Question Review" : "Review Questions & Explanations"}</span>
            {showReview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showReview && (
            <div className="flex flex-col gap-4 text-left">
              {results.scoredAnswers.map((ans, idx) => {
                const questionText = ans.questionSnapshot?.text || `Question ${idx + 1}`;
                const options = ans.questionSnapshot?.options || [];
                const explanation = ans.questionSnapshot?.explanation;

                return (
                  <div
                    key={ans.questionId || idx}
                    className={`p-4 border-2 rounded-xl flex flex-col gap-3 ${
                      ans.isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-rose-500/5 border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-extrabold text-xs md:text-sm text-text-primary">
                        {idx + 1}. {questionText}
                      </h5>
                      {ans.isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black shrink-0">
                          <CheckCircle2 size={16} /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-black shrink-0">
                          <XCircle size={16} /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="text-xs flex flex-col gap-1 bg-surface/50 p-2.5 rounded-lg border border-border/50">
                      <div>
                        <span className="text-text-secondary font-bold">Your answer: </span>
                        <span
                          className={`font-black ${
                            ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {ans.selectedOptionId || ans.submittedText || "No answer submitted"}
                        </span>
                      </div>
                      {!ans.isCorrect && ans.correctOption && (
                        <div>
                          <span className="text-text-secondary font-bold">Correct option: </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {ans.correctOption}
                          </span>
                        </div>
                      )}
                    </div>

                    {explanation && (
                      <div className="p-3 bg-bg-primary border border-border rounded-lg text-xs">
                        <span className="font-black text-text-secondary block uppercase text-[10px] tracking-wider mb-1">
                          Explanation
                        </span>
                        <p className="text-text-primary font-medium">{explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
