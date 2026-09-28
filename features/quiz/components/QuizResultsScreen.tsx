"use client";

import React from "react";
import {
  Trophy,
  Zap,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Star,
  Award,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubmitAttemptResponseDto } from "../types";
import { useQuests, useClaimQuestReward, useDashboard } from "@/features/gamification/hooks";
import { QuizQuestionReviewList } from "./QuizQuestionReviewList";

interface QuizResultsScreenProps {
  results: SubmitAttemptResponseDto;
  onReset: () => void;
  onContinueNextLevel?: (nextLevelId: string) => void;
}

export function QuizResultsScreen({ results, onReset, onContinueNextLevel }: QuizResultsScreenProps) {

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
            "w-24 h-24 rounded-3xl flex items-center justify-center border-[3.5px] shadow-[0_6px_0_rgba(20,24,39,0.9)]",
            isPassed ? "bg-primary border-border" : "bg-surface-muted border-border",
          ].join(" ")}
        >
          <Trophy className="w-12 h-12 text-text-primary stroke-[2.5]" />
        </div>
        {results.isFirstAttempt && (
          <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-primary border-[2px] border-border text-[10px] font-black rounded-full shadow-[0_2px_0_#141827] uppercase text-text-primary">
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
          <div className="flex items-center gap-2 mt-1 bg-surface border-[2.5px] border-border px-5 py-2.5 rounded-2xl shadow-[0_3px_0_#141827]">
            {[1, 2, 3].map((starIndex) => {
              const isEarned = starIndex <= journeyOutcome.masteryStarsEarned;
              return (
                <Star
                  key={starIndex}
                  size={22}
                  className={
                    isEarned
                      ? "fill-[#F6D86B] text-[#141827] stroke-[2.5px]"
                      : "fill-transparent text-[#141827]/25 stroke-[2px]"
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
            <div className="w-11 h-11 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shrink-0 shadow-[0_2px_0_#141827]">
              <Unlock size={22} className="text-text-primary stroke-[2.5]" />
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
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-surface border-[2px] border-border rounded-xl text-text-primary shrink-0 shadow-[0_1.5px_0_#141827]">
            Unlocked
          </span>
        </div>
      )}

      {/* Reward card */}
      <div className="bg-surface border-[3px] border-border p-6 rounded-2xl w-full flex flex-col gap-4 shadow-[0_6px_0_rgba(20,24,39,0.9)] text-left">
        <div className="flex justify-between items-center border-b-[2px] border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
              <Zap size={20} className="fill-text-primary text-text-primary stroke-[2]" />
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
          <span className="text-lg font-black text-text-primary px-3.5 py-1 bg-primary border-[2px] border-border rounded-xl shadow-[0_2px_0_#141827]">
            +{results.xpAwarded} XP
          </span>
        </div>

        {/* Level progress */}
        {dashboard?.xp && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-text-primary">Level {dashboard.xp.level}</span>
              <span className="text-text-secondary font-bold">
                {dashboard.xp.current} / {dashboard.xp.next} XP
              </span>
            </div>
            <div className="w-full h-3.5 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-primary border-[1.5px] border-border rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${Math.min(100, Math.max(4, (dashboard.xp.current / dashboard.xp.next) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Quest rewards */}
        {completedUnclaimedQuests.length > 0 && (
          <div className="flex flex-col gap-3 p-3.5 bg-primary/10 border-[2px] border-border rounded-xl">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-text-primary shrink-0 stroke-[2.5]" />
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
                  className="flex justify-between items-center gap-2 bg-surface p-3 rounded-xl border-[2px] border-border shadow-[0_2px_0_#141827]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Star size={16} className="fill-[#F6D86B] text-[#141827] stroke-[2px] shrink-0" />
                    <span className="text-xs font-black text-text-primary truncate">
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
                    className="px-3.5 py-1.5 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-75"
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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
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
                  className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_4px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
                >
                  <span>CONTINUE TO NEXT LEVEL</span>
                  <ArrowRight size={16} className="stroke-[3]" />
                </button>
              ) : (
                <Link
                  href="/study"
                  className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_4px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 tracking-wider"
                >
                  <span>RETURN TO JOURNEY MAP</span>
                  <ArrowRight size={16} className="stroke-[3]" />
                </Link>
              )}

              {journeyOutcome.masteryStarsEarned < 3 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full sm:w-auto px-5 py-3.5 border-[2.5px] border-border bg-surface hover:bg-bg-primary rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
                >
                  <RotateCcw size={15} className="stroke-[2.5]" />
                  <span>RETRY FOR 3 STARS</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_4px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
              >
                <RotateCcw size={16} className="stroke-[2.5]" />
                <span>RETRY CHALLENGE</span>
              </button>
              <Link
                href="/study"
                className="w-full sm:w-auto px-5 py-3.5 border-[2.5px] border-border bg-surface hover:bg-bg-primary rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 tracking-wider"
              >
                <ArrowLeft size={16} className="stroke-[2.5]" />
                <span>RETURN TO MAP</span>
              </Link>
            </>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-3.5 border-[2.5px] border-border bg-surface hover:bg-bg-primary rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
            >
              <RotateCcw size={15} className="stroke-[2.5]" />
              <span>TAKE ANOTHER QUIZ</span>
            </button>
            <Link
              href="/study"
              className="w-full sm:w-auto px-5 py-3.5 bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 tracking-wider"
            >
              <ArrowLeft size={16} className="stroke-[2.5]" />
              <span>RETURN TO STUDY</span>
            </Link>
          </>
        )}
      </div>

      {/* Question review */}
      <QuizQuestionReviewList scoredAnswers={results.scoredAnswers} />
    </div>
  );
}
