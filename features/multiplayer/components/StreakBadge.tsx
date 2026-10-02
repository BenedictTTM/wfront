"use client";
// features/multiplayer/components/StreakBadge.tsx

import React from "react";
import { Flame } from "lucide-react";
import { getStreakTier, StreakTier } from "../utils/streak";

interface StreakBadgeProps {
  streak: number;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Renders a lightweight, tiered streak indicator according to design requirements:
 * - 0–1 correct: hidden (no major celebration)
 * - 2 correct: subtle indicator ("🔥 2 in a row")
 * - 3–4 correct: clear pill ("🔥 3 STREAK")
 * - 5+ correct: prominent but restrained pill ("🔥 5 STREAK")
 */
export function StreakBadge({ streak, className = "", size = "md" }: StreakBadgeProps) {
  const tier: StreakTier = getStreakTier(streak);

  if (tier === "none") {
    return null;
  }

  if (tier === "subtle") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border border-border/60 text-text-secondary font-bold text-[9px] uppercase tracking-wider motion-reduce:transition-none ${className}`}
        title={`${streak} consecutive correct answers`}
      >
        <Flame size={size === "sm" ? 10 : 11} className="text-amber-500/80 shrink-0" />
        <span>{streak} in a row</span>
      </span>
    );
  }

  if (tier === "streak3") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider shadow-[0_1px_0_rgba(245,158,11,0.2)] animate-in fade-in duration-200 motion-reduce:animate-none ${className}`}
        title={`${streak} streak`}
      >
        <Flame size={size === "sm" ? 11 : 12} className="text-amber-500 shrink-0" />
        <span>{streak} STREAK</span>
      </span>
    );
  }

  // 5+: More prominent but restrained feedback
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 border-2 border-amber-500/70 text-amber-800 dark:text-amber-200 font-black text-[10px] uppercase tracking-wider shadow-[0_2px_0_rgba(245,158,11,0.35)] ring-2 ring-amber-500/20 animate-in fade-in duration-200 motion-reduce:animate-none ${className}`}
      title={`${streak} streak`}
    >
      <Flame
        size={size === "sm" ? 12 : 13}
        className="text-amber-500 shrink-0 animate-pulse motion-reduce:animate-none"
      />
      <span>{streak} STREAK</span>
    </span>
  );
}
