"use client";

import React from "react";
import { useQuests, useClaimQuestReward } from "@/features/gamification/hooks";
import { toast } from "sonner";
import {
  Trophy,
  Star,
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  Crown,
  Medal,
  Flame,
} from "lucide-react";
import type { UserQuest } from "@/features/gamification/types";

// Map quest slugs → icon + color theme
const ACHIEVEMENT_STYLE: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  "first-steps": {
    icon: <Star size={20} fill="currentColor" />,
    color: "text-[#FF9E2C]",
    bg: "bg-[#FFF8E7]",
  },
  "quiz-enthusiast": {
    icon: <BookOpen size={20} />,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  "knowledge-master": {
    icon: <Zap size={20} fill="currentColor" />,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  "perfect-mind": {
    icon: <Target size={20} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  unstoppable: {
    icon: <Flame size={20} fill="currentColor" />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  legend: {
    icon: <Crown size={20} fill="currentColor" />,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
};

const DEFAULT_STYLE = {
  icon: <Medal size={20} />,
  color: "text-text-secondary",
  bg: "bg-bg-secondary",
};

function AchievementCard({ quest }: { quest: UserQuest }) {
  const claimMutation = useClaimQuestReward();
  const percent = Math.min(
    100,
    Math.max(0, (quest.currentCount / quest.targetCount) * 100)
  );
  const canClaim = quest.completed && !quest.rewardClaimed;
  const isClaiming =
    claimMutation.isPending && claimMutation.variables === quest.periodId;

  const style = ACHIEVEMENT_STYLE[quest.slug] ?? DEFAULT_STYLE;

  return (
    <div
      className={`relative p-5 border-2 rounded-2xl flex gap-4 items-start transition-all duration-200 ${
        quest.rewardClaimed
          ? "border-border bg-surface shadow-[0_3px_0_#141827]"
          : quest.completed
          ? "border-primary bg-[#FFFDF6] shadow-[0_3px_0_#141827]"
          : "border-border bg-surface shadow-[0_3px_0_#141827]"
      }`}
    >
      {/* Completed ribbon */}
      {quest.rewardClaimed && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={16} className="text-green-500" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl border-2 border-border flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
      >
        {quest.completed && !quest.rewardClaimed ? (
          <Star size={20} className="text-[#FF9E2C]" fill="currentColor" />
        ) : quest.rewardClaimed ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          style.icon
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-extrabold text-sm text-text-primary leading-tight">
            {quest.title}
          </h4>
          <span className="text-xs font-extrabold text-[#FF9E2C] shrink-0">
            +{quest.xpAward} XP
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {quest.description}
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2.5 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-500 border-r-2 border-border ${
                quest.completed ? "bg-primary" : "bg-primary/60"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[10px] font-extrabold text-text-secondary shrink-0 tabular-nums">
            {quest.currentCount}/{quest.targetCount}
          </span>
        </div>

        {/* Status badge / Claim button */}
        {quest.rewardClaimed ? (
          <span className="inline-block mt-1 text-[10px] font-extrabold bg-[#F0FAF0] border border-green-200 px-2 py-0.5 rounded-full text-green-600 w-fit">
            ✓ UNLOCKED
          </span>
        ) : canClaim ? (
          <button
            type="button"
            onClick={() =>
              claimMutation.mutate(quest.periodId, {
                onSuccess: (data) =>
                  toast.success(
                    `🏆 Claimed +${data.xpAwarded} XP for "${data.questTitle}"!`
                  ),
                onError: (err: any) =>
                  toast.error(err.message || "Failed to claim reward"),
              })
            }
            disabled={claimMutation.isPending}
            className="mt-1 w-fit px-3 py-1.5 bg-primary text-text-primary border-2 border-border rounded-lg font-black text-[10px] shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
          >
            {isClaiming ? "CLAIMING..." : `CLAIM (+${quest.xpAward} XP)`}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold bg-surface-muted border border-border-muted px-2 py-0.5 rounded-full text-text-secondary w-fit">
            <Lock size={8} />
            {percent > 0 ? "IN PROGRESS" : "LOCKED"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { data: quests, isLoading } = useQuests();

  const achievements = (quests ?? []).filter((q) => q.type === "ACHIEVEMENT");
  const unlockedCount = achievements.filter((q) => q.rewardClaimed).length;
  const totalCount = achievements.length;

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Trophy className="text-[#FF9E2C]" />
          <span>Your Achievements</span>
        </h2>
        <p className="text-sm text-text-secondary">
          Track your learning milestones and rewards gained from study sessions.
        </p>
      </div>

      {/* Progress summary */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center gap-4 p-4 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827]">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-border flex items-center justify-center text-[#FF9E2C]">
            <Medal size={24} />
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-sm font-extrabold text-text-primary">
              {unlockedCount} / {totalCount} Unlocked
            </span>
            <div className="h-2.5 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 border-r-2 border-border"
                style={{
                  width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievement grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-surface border-2 border-border animate-pulse"
            />
          ))}
        </div>
      ) : achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((q) => (
            <AchievementCard key={q.questId} quest={q} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface border-2 border-dashed border-border-muted flex items-center justify-center text-text-secondary">
            <Trophy size={28} />
          </div>
          <div>
            <p className="font-extrabold text-text-primary">No achievements yet</p>
            <p className="text-xs text-text-secondary mt-1">
              Complete quizzes to start earning achievement milestones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
