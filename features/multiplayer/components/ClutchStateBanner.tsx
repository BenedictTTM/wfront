"use client";
// features/multiplayer/components/ClutchStateBanner.tsx

import React from "react";
import { Zap, Target, Swords, Gauge } from "lucide-react";
import {
  ClutchAnalysis,
  GameState,
  evaluateClutchState,
} from "../utils/clutchEngine";

export interface ClutchStateBannerProps {
  analysis?: ClutchAnalysis;
  state?: GameState;
  className?: string;
}

/**
 * Visual Alert Banner for Endgame Clutch States (Questions 8, 9, 10).
 * If CLUTCH_WINDOW: Background is dark purple #2E1065 with a pulsating gold border #F59E0B.
 */
export const ClutchStateBanner = React.memo(function ClutchStateBanner({
  analysis,
  state,
  className = "",
}: ClutchStateBannerProps) {
  const currentAnalysis = analysis || (state ? evaluateClutchState(state) : null);

  if (!currentAnalysis) return null;

  const { status, headlineCopy, subCopy } = currentAnalysis;

  // Render contextual styles based on mathematical clutch status
  let containerStyles = "";
  let iconNode: React.ReactNode = null;

  switch (status) {
    case "CLUTCH_WINDOW":
      // Background: dark purple #2E1065 with pulsating gold border #F59E0B
      containerStyles =
        "bg-[#2E1065] border-[#F59E0B] text-[#FEF3C7] shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-pulse";
      iconNode = <Zap size={16} className="text-[#F59E0B] shrink-0 fill-[#F59E0B]" />;
      break;

    case "DECIDED":
      // Score locked — mastery focus
      containerStyles =
        "bg-slate-900/95 border-indigo-500/70 text-indigo-100 shadow-[0_2px_12px_rgba(99,102,241,0.2)]";
      iconNode = <Target size={16} className="text-indigo-400 shrink-0" />;
      break;

    case "TIED":
      // Dead heat — perfect tie
      containerStyles =
        "bg-amber-950/80 border-amber-400 text-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.25)]";
      iconNode = <Swords size={16} className="text-amber-400 shrink-0" />;
      break;

    case "COMFORTABLE":
    default:
      // Early / mid match pace
      containerStyles =
        "bg-slate-900/80 border-slate-700/80 text-slate-200 shadow-sm";
      iconNode = <Gauge size={16} className="text-slate-400 shrink-0" />;
      break;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      data-testid="clutch-state-banner"
      data-status={status}
      className={`w-full border-[2.5px] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 transition-all duration-300 ${containerStyles} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {iconNode}
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-black tracking-wide uppercase truncate">
            {headlineCopy}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold opacity-90 truncate">
            {subCopy}
          </span>
        </div>
      </div>

      {status === "CLUTCH_WINDOW" && (
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 text-[10px] font-black uppercase tracking-wider">
          LIVE
        </span>
      )}
    </aside>
  );
});
