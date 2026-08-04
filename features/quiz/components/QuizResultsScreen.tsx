import React, { useState } from "react";
import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, ArrowLeft, ChevronDown, ChevronUp, Star, Award } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubmitAttemptResponseDto } from "../types";
import { useQuests, useClaimQuestReward, useDashboard } from "@/features/gamification/hooks";

interface QuizResultsScreenProps {
  results: SubmitAttemptResponseDto;
  onReset: () => void;
}

export function QuizResultsScreen({ results, onReset }: QuizResultsScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const { data: quests } = useQuests();
  const { data: dashboard } = useDashboard();
  const claimRewardMutation = useClaimQuestReward();

  const totalQuestions = results.scoredAnswers?.length || 0;
  const correctAnswersCount = results.scoredAnswers?.filter((a) => a.isCorrect).length || 0;

  const isPassed = results.score >= 50;

  // Filter completed quests or active quests to highlight in awards
  const completedUnclaimedQuests = (quests || []).filter((q) => q.completed && !q.rewardClaimed);

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200 w-full max-w-xl mx-auto">
      {/* Header icon / badge */}
      <div className="relative">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-offset ${
            isPassed
              ? "bg-primary/30 border-border text-text-primary"
              : "bg-surface-muted border-border text-text-secondary"
          }`}
        >
          <Trophy className="w-10 h-10 text-text-primary" />
        </div>
        {results.isFirstAttempt && (
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-primary border-2 border-border text-[10px] font-black rounded-full shadow-sm uppercase text-text-primary">
            1st Try!
          </span>
        )}
      </div>

      {/* Main Score Headline */}
      <div className="flex flex-col gap-1">
        <h4 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          {isPassed ? "Awesome Effort! 🎉" : "Practice Session Complete"}
        </h4>
        <p className="text-sm font-extrabold text-text-secondary">
          You scored <span className="text-text-primary font-black">{results.score}%</span> (
          {correctAnswersCount} / {totalQuestions} correct)
        </p>
      </div>

      {/* Rewards & XP Granted Card */}
      <div className="bg-surface border-2.5 border-border p-5 rounded-2xl w-full flex flex-col gap-4 shadow-offset text-left">
        <div className="flex justify-between items-center border-b-2 border-border/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
              <Zap size={18} className="fill-text-primary text-text-primary" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-text-secondary tracking-wider block">Reward Granted</span>
              <span className="text-sm font-black text-text-primary">Quiz Submission</span>
            </div>
          </div>
          <span className="text-lg font-black text-[#FF9E2C] px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/40 rounded-xl">
            +{results.xpAwarded} XP
          </span>
        </div>

        {/* Level Progress Indicator */}
        {dashboard?.xp && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-text-primary">Level {dashboard.xp.level}</span>
              <span className="text-text-secondary">{dashboard.xp.current} / {dashboard.xp.next} XP</span>
            </div>
            <div className="w-full h-3.5 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-primary border-r-2 border-border transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, (dashboard.xp.current / dashboard.xp.next) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Quests Banner / Award Trigger */}
        {completedUnclaimedQuests.length > 0 && (
          <div className="mt-2 flex flex-col gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-500 rounded-xl">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                Quest Completed! Claim your reward:
              </span>
            </div>

            {completedUnclaimedQuests.map((q) => {
              const isClaimingThisQuest = claimRewardMutation.isPending && claimRewardMutation.variables === q.periodId;
              return (
                <div key={q.periodId} className="flex justify-between items-center gap-2 bg-surface p-2.5 rounded-lg border border-amber-300 dark:border-amber-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <Star size={16} fill="#E28743" className="text-[#E28743] shrink-0" />
                    <span className="text-xs font-extrabold text-text-primary truncate">{q.title}</span>
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
                    className="px-3 py-1 bg-primary text-text-primary border-2 border-border rounded-lg text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-75"
                  >
                    {isClaimingThisQuest ? "CLAIMING..." : `CLAIM +${q.xpAward} XP`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
