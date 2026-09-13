// features/curriculum/components/journey/JourneyNode.tsx

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Lock,
  Play,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { JourneyLevelItem, LevelProgressState } from "../../types";
import { MasteryIndicator } from "./MasteryIndicator";

interface JourneyNodeProps {
  level: JourneyLevelItem;
  isCurrent: boolean;
  onSelect: (level: JourneyLevelItem) => void;
  offsetPosition?: "left" | "center" | "right";
}

export function JourneyNode({
  level,
  isCurrent,
  onSelect,
  offsetPosition = "center",
}: JourneyNodeProps) {
  // Determine effective visual state
  const state: LevelProgressState = isCurrent ? "ACTIVE" : level.state;
  const isLocked = state === "LOCKED";
  const isCompleted = state === "COMPLETED";
  const isMastered = state === "MASTERED" || level.isMastered;
  const isAvailable = state === "AVAILABLE";
  const isActive = isCurrent || state === "ACTIVE";

  // Alignment classes for winding serpentine path
  const alignmentClass =
    offsetPosition === "left"
      ? "justify-start pl-6 sm:pl-10"
      : offsetPosition === "right"
      ? "justify-end pr-6 sm:pr-10"
      : "justify-center";

  return (
    <div
      className={`w-full max-w-[280px] sm:max-w-[320px] mx-auto flex items-center relative z-10 py-1 ${alignmentClass}`}
    >
      <div className="flex flex-col items-center group relative">
        {/* "YOU ARE HERE" Beacon Tag for the current active level */}
        {isActive && (
          <div className="absolute -top-7 z-20 flex items-center gap-1 px-2.5 py-0.5 bg-primary border-[2px] border-border rounded-full text-[10px] font-black tracking-widest text-text-primary uppercase shadow-[0_2px_0_#141827] animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>START HERE</span>
          </div>
        )}

        {/* Mastered Crown Beacon */}
        {isMastered && (
          <div className="absolute -top-5 z-20 text-amber-500 drop-shadow-[0_2px_0_#141827]">
            <Crown size={20} className="fill-amber-400 stroke-[2] text-border" />
          </div>
        )}

        {/* Outer pulsating ring for active current node */}
        {isActive && (
          <div className="absolute inset-0 -m-2 rounded-full border-[3px] border-primary/60 animate-ping pointer-events-none" />
        )}

        {/* Interactive Node Button */}
        <button
          type="button"
          onClick={() => onSelect(level)}
          aria-label={`${level.title} - Status: ${state}`}
          className={[
            "relative flex items-center justify-center transition-all duration-200 outline-none select-none",
            "w-20 h-20 rounded-3xl border-[3.5px] border-border",
            // 3D Hard drop-shadow
            isActive
              ? "bg-primary shadow-[0_8px_0_#141827] scale-105 hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_#141827] ring-4 ring-primary/40 cursor-pointer"
              : isMastered
              ? "bg-gradient-to-b from-amber-200 to-amber-400 shadow-[0_6px_0_#141827] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_#141827] cursor-pointer"
              : isCompleted
              ? "bg-secondary shadow-[0_5px_0_#141827] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#141827] cursor-pointer"
              : isAvailable
              ? "bg-surface shadow-[0_6px_0_#141827] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_#141827] cursor-pointer"
              : "bg-surface-muted/80 opacity-60 shadow-[0_4px_0_#D8D8D8] cursor-pointer hover:opacity-75",
          ].join(" ")}
        >
          {/* Level Order Number Badge */}
          <span className="absolute top-1 left-2 text-[10px] font-black text-text-primary/70">
            {level.orderIndex + 1}
          </span>

          {/* Node Central Icon */}
          <div className="flex flex-col items-center justify-center">
            {isActive && (
              <Play
                size={28}
                className="text-text-primary fill-text-primary stroke-[2] ml-0.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]"
              />
            )}
            {isMastered && (
              <Trophy
                size={26}
                className="text-text-primary fill-amber-300 stroke-[2]"
              />
            )}
            {isCompleted && !isMastered && (
              <CheckCircle2
                size={28}
                className="text-text-primary stroke-[2.5]"
              />
            )}
            {isAvailable && !isActive && (
              <Target
                size={26}
                className="text-text-primary stroke-[2.5]"
              />
            )}
            {isLocked && (
              <Lock
                size={24}
                className="text-text-secondary stroke-[2]"
              />
            )}
          </div>

          {/* XP badge on node corner if available */}
          {!isCompleted && !isLocked && (
            <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 bg-surface border-[1.5px] border-border rounded-md text-[9px] font-black text-text-primary shadow-[0_1px_0_#141827]">
              +{level.xpReward} XP
            </span>
          )}
        </button>

        {/* Node Label & Stars below button */}
        <div className="flex flex-col items-center mt-2 max-w-[120px] text-center">
          <span className="text-xs font-black text-text-primary leading-tight line-clamp-1">
            {level.title}
          </span>

          {/* Stars indicator if completed/mastered */}
          {(isCompleted || isMastered || level.masteryStars > 0) && (
            <div className="mt-0.5">
              <MasteryIndicator
                stars={level.masteryStars}
                size="sm"
                isMastered={isMastered}
              />
            </div>
          )}

          {/* Lock subtext */}
          {isLocked && (
            <span className="text-[10px] font-bold text-text-secondary/80 mt-0.5">
              Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
