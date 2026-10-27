// features/gamification/components/AchievementCard.tsx

"use client";

import React from "react";
import { Gift, Check } from "lucide-react";
import type { AchievementBase } from "../constants";

export type AchievementStatus = "IN_PROGRESS" | "CAN_CLAIM" | "UNLOCKED" | "LOCKED";

export interface AchievementItem extends Partial<AchievementBase> {
  id: string;
  title: string;
  description?: string;
  category: "Quizzes" | "Streaks" | "Mastery" | "Multiplayer";
  icon: string;
  targetCount: number;
  currentCount: number;
  xpAward: number;
  gemsAward?: number;
  status: AchievementStatus;
  currentTier?: number;
  nextTarget?: number;
  remaining?: number;
  completed?: boolean;
  unmetRequirementNote?: string | null;
  crestName?: string | null;
  badgeName?: string | null;
  crestUnlocked?: boolean;
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | null;
  tiers?: Array<{
    id: string;
    tier: number;
    target: number;
    xpReward: number;
    gemReward: number;
    description?: string;
    completed?: boolean;
    completedAt?: string | null;
  }>;
}

interface AchievementCardProps {
  item: AchievementItem;
  onClaim: (item: AchievementItem) => void;
}

const BADGE_EMOJIS: Record<string, string> = {
  "quiz-enthusiast": "📖",
  "speed-demon": "⚡",
  "streak-prodigy": "🔥",
  "sharpshooter": "🎯",
  "centurion-sharpshooter": "🎯",
  "gladiator-waec": "⚔️",
  "arena-contender": "⚔️",
};

const CREST_EMOJIS: Record<string, string> = {
  "quiz-enthusiast": "🎖️",
  "Achimota Scholar's Crest": "🎖️",
  "achimota-scholars-crest": "🎖️",
  "speed-demon": "⚡",
  "Chronos Sprinter": "⚡",
  "chronos-sprinter": "⚡",
  "streak-prodigy": "🔥",
  "Olympian Torch of Habit": "🔥",
  "olympian-torch-of-habit": "🔥",
  "sharpshooter": "🎯",
  "centurion-sharpshooter": "🎯",
  "Centurion Bullseye": "🎯",
  "centurion-bullseye": "🎯",
  "arena-contender": "⚔️",
  "gladiator-waec": "⚔️",
  "Gladiator of WAEC": "⚔️",
  "gladiator-of-waec": "⚔️",
};

export function AchievementCard({ item, onClaim }: AchievementCardProps) {
  const currentTier = item.currentTier ?? 1;
  const isUnlocked = item.status === "UNLOCKED" || Boolean(item.completed);
  const isClaimable = item.status === "CAN_CLAIM";

  const isCrestUnlocked = Boolean(
    item.crestUnlocked ||
    item.completed ||
    item.status === "UNLOCKED" ||
    (currentTier >= 3 && (item.remaining === 0 || item.currentCount >= (item.nextTarget ?? item.targetCount ?? 1))) ||
    (item.tiers && item.tiers.find((t) => t.tier === 3)?.completed)
  );

  const activeTier = item.tiers?.find((t) => t.tier === currentTier) ?? item.tiers?.[0];
  const target = item.nextTarget ?? activeTier?.target ?? item.targetCount ?? 1;
  const percent = isUnlocked
    ? 100
    : Math.min(100, Math.max(0, target > 0 ? (item.currentCount / target) * 100 : 0));

  const xpReward = activeTier?.xpReward ?? item.xpAward ?? 0;
  const gemReward = activeTier?.gemReward ?? item.gemsAward;

  // Resolve clear, single-line task requirement description for active tier
  const requirementDescription =
    (item.id === "quiz-enthusiast"
      ? currentTier === 1
        ? "Complete 10 quizzes"
        : currentTier === 2
        ? "Complete 50 quizzes"
        : "Complete 100 quizzes (80%+ acc)"
      : item.id === "speed-demon"
      ? currentTier === 1
        ? "Finish a quiz in under 3 mins"
        : currentTier === 2
        ? "Finish 5 quizzes in <2 mins"
        : "Finish 10 quizzes in <2 mins"
      : item.id === "streak-prodigy"
      ? currentTier === 1
        ? "Reach a 7-day study streak"
        : currentTier === 2
        ? "Reach a 14-day study streak"
        : "Reach a 30-day study streak"
      : item.id === "sharpshooter" || item.id === "centurion-sharpshooter"
      ? currentTier === 1
        ? "Score 100% on 1 timed mock"
        : currentTier === 2
        ? "Score 100% on 3 timed mocks"
        : "Score 100% on 5 timed mocks"
      : item.id === "arena-contender" || item.id === "gladiator-waec"
      ? currentTier === 1
        ? "Win 5 live 1v1 matches"
        : currentTier === 2
        ? "Win 15 live 1v1 matches"
        : "Win 30 live 1v1 matches"
      : activeTier?.description ||
        item.tierText?.replace(/^Tier \d+:\s*/, "") ||
        item.description ||
        "Complete qualifying activities to unlock");

  const badgeEmoji = item.icon || BADGE_EMOJIS[item.id] || "🏆";
  const crestTitle = item.crestName || item.badgeName || `${item.title} Crest`;
  const crestEmoji = CREST_EMOJIS[crestTitle] || CREST_EMOJIS[item.id] || "🎖️";

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-neutral-900 bg-white flex flex-col justify-between gap-2.5 sm:gap-3 shadow-[0_2px_0_#141827] transition-all ${
        isUnlocked
          ? "bg-emerald-50/20 border-emerald-900"
          : isClaimable
          ? "bg-amber-50/40 ring-2 ring-amber-400"
          : "bg-white"
      }`}
    >
      {/* ── Row 1: Header (Icon + Title + Requirement Description + Reward Pills) ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* High-Contrast Visible Badge Icon Box */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-neutral-900 bg-amber-50 flex items-center justify-center shrink-0 shadow-[0_1.5px_0_#141827] select-none text-xl sm:text-2xl leading-none mt-0.5">
            <span role="img" aria-label={item.title}>
              {badgeEmoji}
            </span>
          </div>

          {/* Title & Requirement Column (Single line on mobile) */}
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug truncate">
              {item.title}
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-neutral-600 mt-0.5 leading-snug truncate">
              {requirementDescription}
            </p>
          </div>
        </div>

        {/* Reward Pills */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 items-start mt-0.5">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full border border-neutral-900 bg-amber-100 text-neutral-900 font-bold text-[10px] sm:text-[11px] shadow-xs whitespace-nowrap">
            +{xpReward} XP
          </span>
          {gemReward ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full border border-neutral-900 bg-blue-100 text-blue-950 font-bold text-[10px] sm:text-[11px] shadow-xs whitespace-nowrap">
              +{gemReward} 💎
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Row 2: Inline Tier Stepper + Progress Bar ── */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5">
          {/* Left side: Tier Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[1, 2, 3].map((tNum) => {
              const isTierDone =
                (item.tiers?.find((t) => t.tier === tNum)?.completed) ??
                (isUnlocked || currentTier > tNum);
              const isCurrent = currentTier === tNum && !isUnlocked;

              if (isCurrent) {
                return (
                  <span
                    key={tNum}
                    className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full border border-neutral-900 bg-amber-100 text-neutral-900 shrink-0"
                  >
                    (T{tNum}) Tier {tNum}
                  </span>
                );
              }

              if (isTierDone) {
                return (
                  <span
                    key={tNum}
                    className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full border border-emerald-600 bg-emerald-100 text-emerald-900 shrink-0"
                  >
                    ✓ T{tNum}
                  </span>
                );
              }

              return (
                <span
                  key={tNum}
                  className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200 shrink-0"
                >
                  (T{tNum})
                </span>
              );
            })}
          </div>

          {/* Right side: Tabular Counter or Claim CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {isClaimable ? (
              <button
                type="button"
                onClick={() => onClaim(item)}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 border border-neutral-900 rounded-md font-bold text-[11px] shadow-xs active:translate-y-0.5 transition-all cursor-pointer animate-pulse"
              >
                <Gift className="w-3 h-3" />
                <span>CLAIM</span>
              </button>
            ) : isUnlocked ? (
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400 flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 stroke-[3]" />
                <span>COMPLETED</span>
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs font-bold tabular-nums text-neutral-900 shrink-0">
                {item.currentCount} / {target}
                {item.unit || ""}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 sm:h-2.5 w-full rounded-full border border-neutral-900 bg-neutral-100 overflow-hidden">
          <div
            className={`h-full border-r border-neutral-900 transition-all duration-300 ${
              isUnlocked ? "bg-emerald-500" : "bg-amber-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Unmet constraint note (if any, e.g. accuracy gate) */}
        {item.unmetRequirementNote && !isUnlocked && (
          <p className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
            {item.unmetRequirementNote}
          </p>
        )}
      </div>

      {/* ── Row 3: Compact Prestige Crest / Honor Badge Footer ── */}
      <div className="pt-2 sm:pt-2.5 border-t border-neutral-200 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Left side: Crest Icon + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-neutral-900 ${
              isCrestUnlocked ? "bg-amber-100" : "bg-neutral-100"
            } flex items-center justify-center text-[10px] sm:text-xs shrink-0 select-none shadow-2xs`}
          >
            <span>{crestEmoji}</span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-neutral-800 truncate">
            {crestTitle}
          </span>
        </div>

        {/* Right side: Rarity / Completed Badge */}
        {isCrestUnlocked ? (
          <span className="px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-900 border border-emerald-500 shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap">
            <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-700 stroke-[3]" />
            <span>COMPLETED</span>
          </span>
        ) : (
          <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-md bg-neutral-100 text-neutral-600 border border-neutral-300 shrink-0 whitespace-nowrap">
            {item.rarity ?? "RARE"} • T3
          </span>
        )}
      </div>
    </div>
  );
}
