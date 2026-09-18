// features/gamification/components/AchievementCard.tsx

"use client";

import React from "react";
import { Gift, Check, Lock } from "lucide-react";
import type { AchievementBase } from "../constants";

export type AchievementStatus = "IN_PROGRESS" | "CAN_CLAIM" | "UNLOCKED" | "LOCKED";

export interface AchievementItem extends AchievementBase {
  currentCount: number;
  status: AchievementStatus;
}

interface AchievementCardProps {
  item: AchievementItem;
  onClaim: (item: AchievementItem) => void;
}

export function AchievementCard({ item, onClaim }: AchievementCardProps) {
  const percent = Math.min(
    100,
    Math.max(0, (item.currentCount / item.targetCount) * 100)
  );

  const isClaimable = item.status === "CAN_CLAIM";
  const isUnlocked = item.status === "UNLOCKED";
  const isLocked = item.status === "LOCKED";

  return (
    <div
      className={`p-5 border-2.5 border-border rounded-2xl shadow-offset flex flex-col justify-between gap-3.5 transition-all ${
        isUnlocked
          ? "bg-surface/90 opacity-95"
          : isClaimable
          ? "bg-primary/10 ring-2 ring-primary ring-offset-1"
          : isLocked
          ? "bg-surface-muted/50 opacity-75"
          : "bg-surface"
      }`}
    >
      {/* Top Row: Icon + Title + XP Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-bg-secondary border-2 border-border flex items-center justify-center text-xl shrink-0 shadow-[0_2px_0_#141827] select-none">
            {item.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-sm sm:text-base text-text-primary tracking-tight leading-snug">
              {item.title}
            </h3>
            <span className="text-xs font-bold text-text-secondary">
              {item.tierText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-primary/25 text-text-primary border-2 border-border px-2.5 py-0.5 rounded-lg font-black text-xs shadow-sm">
            +{item.xpAward} XP
          </span>
          {item.gemsAward && (
            <span className="bg-blue-500/15 text-blue-800 border-2 border-border px-2 py-0.5 rounded-lg font-black text-xs shadow-sm">
              +{item.gemsAward} 💎
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
            <div
              className={`h-full border-r-2 border-border transition-all duration-500 ${
                isUnlocked
                  ? "bg-emerald-400"
                  : isClaimable
                  ? "bg-primary animate-pulse"
                  : "bg-primary"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-black text-text-primary tabular-nums shrink-0">
            {item.currentCount} / {item.targetCount}
            {item.unit || ""}
          </span>
        </div>
      </div>

      {/* Footer: Tier Stars OR Claim Button OR Status Indicator */}
      <div className="flex items-center justify-between pt-1 border-t border-border/15 gap-2">
        <span className="text-xs font-extrabold text-text-secondary flex items-center gap-1">
          {item.tierStars}
        </span>

        {isClaimable ? (
          <button
            type="button"
            onClick={() => onClaim(item)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer animate-bounce"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>CLAIM REWARD</span>
          </button>
        ) : isUnlocked ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <Check className="w-3 h-3 text-emerald-700" />
            UNLOCKED
          </span>
        ) : isLocked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-text-secondary bg-surface-muted border border-border/40 px-2.5 py-0.5 rounded-lg">
            <Lock className="w-3 h-3 text-text-secondary" />
            <span>{item.lockRequirement || "Locked"}</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-text-secondary">
            In Progress
          </span>
        )}
      </div>
    </div>
  );
}
