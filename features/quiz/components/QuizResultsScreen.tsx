"use client";

import React, { useState } from "react";
import {
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubmitAttemptResponseDto } from "../types";
import { useQuests, useClaimQuestReward, useDashboard } from "@/features/gamification/hooks";

interface QuizResultsScreenProps {
  results: SubmitAttemptResponseDto;
  onReset: () => void;
  onContinueNextLevel?: (nextLevelId: string) => void;
}

export function QuizResultsScreen({ results, onReset, onContinueNextLevel }: QuizResultsScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const { data: quests } = useQuests();
  const { data: dashboard } = useDashboard();
  const claimRewardMutation = useClaimQuestReward();

  const totalQuestions = results.scoredAnswers?.length || 0;
  const correctAnswersCount = results.scoredAnswers?.filter((a) => a.isCorrect).length || 0;
  const isPassed = results.score >= 50;
  const journeyOutcome = results.journeyOutcome;

  const completedUnclaimedQuests = (quests || []).filter(
    (q) => q.completed && !q.rewardClaimed,
  );

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200 w-full max-w-xl mx-auto">
      {/* Score badge */}
      <div className="relative">
        <div
          className={[
            "w-20 h-20 rounded-full flex items-center justify-center border-[3px] shadow-[0_4px_0_rgba(20,24,39,0.9)]",
            isPassed ? "bg-primary border-border" : "bg-surface-muted border-border",
          ].join(" ")}
        >
          <Trophy className="w-10 h-10 text-text-primary" />
        </div>
        {results.isFirstAttempt && (
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-primary border-[2px] border-border text-[10px] font-black rounded-full shadow-sm uppercase text-text-primary">
            1st Try!
          </span>
        )}
      </div>

      {/* Headline & Mastery Stars (if Journey) */}
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          {journeyOutcome
            ? journeyOutcome.isPassed
              ? "Challenge Completed! 🎉"
              : "Keep Going, Practice More!"
            : isPassed
              ? "Awesome Effort! 🎉"
              : "Practice Session Complete"}
        </h4>
        <p className="text-sm font-extrabold text-text-secondary">
          You scored{" "}
          <span className="text-text-primary font-black">{results.score}%</span>{" "}
          ({correctAnswersCount} / {totalQuestions} correct)
        </p>

        {journeyOutcome && (
          <div className="flex items-center gap-1.5 mt-1 bg-surface-muted border-[2px] border-border px-4 py-1.5 rounded-full">
            {[1, 2, 3].map((starIndex) => {
              const isEarned = starIndex <= journeyOutcome.masteryStarsEarned;
              return (
                <Star
                  key={starIndex}
                  size={20}
                  className={
                    isEarned
                      ? "fill-primary text-text-primary stroke-[2px]"
                      : "text-text-muted/30 stroke-[2px]"
                  }
                />
              );
            })}
            <span className="text-xs font-black text-text-primary ml-1.5 uppercase tracking-wide">
              {journeyOutcome.masteryStarsEarned === 3
                ? "Mastered"
                : journeyOutcome.masteryStarsEarned > 0
                  ? `${journeyOutcome.masteryStarsEarned} / 3 Stars`
                  : "0 / 3 Stars"}
            </span>
          </div>
        )}
      </div>

      {/* Next Level Unlock Banner */}
      {journeyOutcome?.unlockedNextLevel && (
        <div className="w-full p-4 bg-primary/20 border-[3px] border-border rounded-2xl flex items-center justify-between gap-3 shadow-[0_4px_0_rgba(20,24,39,0.9)] text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shrink-0">
              <Unlock size={20} className="text-text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest block">
                Progression Unlocked
              </span>
              <span className="text-sm font-black text-text-primary">
                {journeyOutcome.nextLevelTitle || "Next Level Ready"}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-surface border-[2px] border-border rounded-lg text-text-primary shrink-0">
            Unlocked
          </span>
        </div>
      )}

      {/* Reward card */}
      <div className="bg-surface border-[2px] border-border p-5 rounded-2xl w-full flex flex-col gap-4 shadow-[0_4px_0_rgba(20,24,39,0.9)] text-left">
        <div className="flex justify-between items-center border-b-[2px] border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
              <Zap size={18} className="fill-text-primary text-text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest block">
                Reward Granted
              </span>
              <span className="text-sm font-black text-text-primary">
                {journeyOutcome ? "Challenge Completion" : "Quiz Submission"}
              </span>
            </div>
          </div>
          <span className="text-lg font-black text-text-primary px-3 py-1 bg-primary/20 border-[2px] border-border rounded-xl">
            +{results.xpAwarded} XP
          </span>
        </div>

        {/* Level progress */}
        {dashboard?.xp && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-text-primary">Level {dashboard.xp.level}</span>
              <span className="text-text-secondary">
                {dashboard.xp.current} / {dashboard.xp.next} XP
              </span>
            </div>
            <div className="w-full h-3.5 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-primary border-r-[2px] border-border transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (dashboard.xp.current / dashboard.xp.next) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Quest rewards */}
        {completedUnclaimedQuests.length > 0 && (
          <div className="flex flex-col gap-3 p-3.5 bg-primary/10 border-[2px] border-border rounded-xl">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-text-primary shrink-0" />
              <span className="text-xs font-black text-text-primary">
                Quest Completed! Claim your reward:
              </span>
            </div>
            {completedUnclaimedQuests.map((q) => {
              const isClaiming =
                claimRewardMutation.isPending && claimRewardMutation.variables === q.periodId;
              return (
                <div
                  key={q.periodId}
                  className="flex justify-between items-center gap-2 bg-surface p-2.5 rounded-lg border-[2px] border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Star size={14} fill="currentColor" className="text-primary shrink-0" />
                    <span className="text-xs font-extrabold text-text-primary truncate">
                      {q.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      claimRewardMutation.mutate(q.periodId, {
                        onSuccess: (data) => {
                          toast.success(`🏆 Claimed +${data.xpAwarded} XP for "${data.questTitle}"!`);
                        },
                      });
                    }}
                    disabled={claimRewardMutation.isPending}
                    className="px-3 py-1.5 bg-primary text-text-primary border-[2px] border-border rounded-lg text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-75"
                  >
                    {isClaiming ? "CLAIMING…" : `CLAIM +${q.xpAward} XP`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons — Prioritizing Next Meaningful Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        {journeyOutcome ? (
          journeyOutcome.isPassed ? (
            <>
              {journeyOutcome.nextLevelId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueNextLevel && journeyOutcome.nextLevelId) {
                      onContinueNextLevel(journeyOutcome.nextLevelId);
                    } else if (typeof window !== "undefined") {
                      window.location.href = `/study/quiz?levelId=${journeyOutcome.nextLevelId}&subjectId=${results.subjectId}&mode=quiz`;
                    }
                  }}
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  CONTINUE TO NEXT LEVEL
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  href="/study"
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  RETURN TO JOURNEY MAP
                  <ArrowRight size={16} />
                </Link>
              )}

              {journeyOutcome.masteryStarsEarned < 3 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full sm:w-auto px-4 py-3 border-[2px] border-border bg-surface rounded-xl text-xs font-black hover:bg-surface-muted shadow-[0_2px_0_rgba(20,24,39,0.9)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  RETRY FOR 3 STARS
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:w-auto flex-1 px-6 py-3 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                RETRY CHALLENGE
              </button>
              <Link
                href="/study"
                className="w-full sm:w-auto px-4 py-3 border-[2px] border-border bg-surface rounded-xl text-xs font-black hover:bg-surface-muted shadow-[0_2px_0_rgba(20,24,39,0.9)] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                RETURN TO MAP
              </Link>
            </>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-2.5 border-[2px] border-border bg-surface rounded-xl text-xs font-black hover:bg-surface-muted shadow-[0_2px_0_rgba(20,24,39,0.9)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              TAKE ANOTHER QUIZ
            </button>
            <Link
              href="/study"
              className="w-full sm:w-auto px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              RETURN TO STUDY
            </Link>
          </>
        )}
      </div>

      {/* Question review */}
      {results.scoredAnswers && results.scoredAnswers.length > 0 && (
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
              {results.scoredAnswers.map((ans, idx) => {
                const questionText = ans.questionSnapshot?.text || `Question ${idx + 1}`;
                const explanation = ans.questionSnapshot?.explanation;

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
