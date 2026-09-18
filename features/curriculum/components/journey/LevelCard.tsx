// features/curriculum/components/journey/LevelCard.tsx

import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Lock,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { JourneyLevelItem } from "../../types";
import { MasteryIndicator } from "./MasteryIndicator";

interface LevelCardProps {
  level: JourneyLevelItem | null;
  stageTitle?: string;
  prerequisiteTitle?: string | null;
  isOpen: boolean;
  isCurrent?: boolean;
  onClose: () => void;
  onStartChallenge: (level: JourneyLevelItem) => void;
  isStarting?: boolean;
}

export function LevelCard({
  level,
  stageTitle,
  prerequisiteTitle,
  isOpen,
  isCurrent = false,
  onClose,
  onStartChallenge,
  isStarting = false,
}: LevelCardProps) {
  if (!isOpen || !level) return null;

  const state = isCurrent ? "ACTIVE" : level.state;
  const isLocked = state === "LOCKED";
  const isCompleted = state === "COMPLETED";
  const isMastered = state === "MASTERED" || level.isMastered;
  const isAvailable = state === "AVAILABLE";
  const isActive = state === "ACTIVE" || isCurrent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-card-title"
    >
      {/* Card Container */}
      <div className="w-full max-w-md bg-surface border-[3px] border-border rounded-3xl shadow-[0_8px_0_rgba(20,24,39,0.95)] p-6 md:p-7 flex flex-col gap-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative background flare */}
        {isActive && (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        )}
        {isMastered && (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* Header: Stage info + Close button */}
        <div className="flex items-center justify-between border-b-[2px] border-border pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary">
              {stageTitle || "Stage"} • Level {level.orderIndex + 1}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 rounded-full border-[2px] border-border flex items-center justify-center bg-surface-muted hover:bg-border-muted/50 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X size={16} className="text-text-primary" />
          </button>
        </div>

        {/* State Badge & Title */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="px-2.5 py-0.5 bg-primary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary shadow-[0_2px_0_#141827]">
                Current Objective
              </span>
            )}
            {isMastered && (
              <span className="px-2.5 py-0.5 bg-amber-300 border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary flex items-center gap-1 shadow-[0_2px_0_#141827]">
                <Crown size={12} className="stroke-[2.5]" />
                Mastered
              </span>
            )}
            {isCompleted && !isMastered && (
              <span className="px-2.5 py-0.5 bg-secondary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary flex items-center gap-1">
                <CheckCircle2 size={12} className="stroke-[2.5]" />
                Completed
              </span>
            )}
            {isAvailable && !isActive && (
              <span className="px-2.5 py-0.5 bg-surface-muted border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary">
                Available
              </span>
            )}
            {isLocked && (
              <span className="px-2.5 py-0.5 bg-surface-muted border-[2px] border-border-muted rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1 opacity-80">
                <Lock size={12} className="stroke-[2]" />
                Locked
              </span>
            )}
          </div>

          <h3
            id="level-card-title"
            className="text-xl md:text-2xl font-black text-text-primary tracking-tight"
          >
            {level.title}
          </h3>

          {level.description && (
            <p className="text-xs md:text-sm text-text-secondary font-medium">
              {level.description}
            </p>
          )}
        </div>

        {/* Locked Prerequisite Explanation Banner */}
        {isLocked && (
          <div className="p-3.5 bg-surface-muted/90 border-[2px] border-border-muted rounded-2xl flex items-start gap-3">
            <Lock size={18} className="text-text-secondary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black text-text-primary">
                Prerequisites Required
              </span>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Complete{" "}
                <strong className="text-text-primary">
                  {prerequisiteTitle || "the previous level"}
                </strong>{" "}
                with at least {level.requiredPassingScore}% passing score to unlock this challenge.
              </p>
            </div>
          </div>
        )}

        {/* Mastery & Historical Performance Card */}
        <div className="bg-surface-muted/60 border-[2px] border-border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
              Mastery Rating
            </span>
            <MasteryIndicator
              stars={level.masteryStars}
              size="md"
              showLabel
              isMastered={isMastered}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-muted/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-text-secondary block">
                Best Score
              </span>
              <span className="text-sm font-black text-text-primary">
                {level.bestScore > 0 ? `${Math.round(level.bestScore)}%` : "--%"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-secondary block">
                Attempts
              </span>
              <span className="text-sm font-black text-text-primary">
                {level.attemptsCount} {level.attemptsCount === 1 ? "time" : "times"}
              </span>
            </div>
          </div>

          {/* Goal tip */}
          <div className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span>
              Achieve <strong>{level.masteryScoreThreshold}%</strong> to earn 3 Stars & Mastery Bonus!
            </span>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-[2px] border-border rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Zap size={14} className="text-primary fill-primary stroke-border" />
            <span>XP Available:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-text-primary px-2 py-0.5 bg-primary/30 border border-border rounded-md">
              +{level.xpReward} Base XP
            </span>
            <span className="text-xs font-black text-amber-700 px-2 py-0.5 bg-amber-100 border border-border rounded-md">
              +{level.masteryXpBonus} Mastery Bonus
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isLocked ? (
            <button
              type="button"
              disabled
              className="w-full py-3.5 bg-surface-muted border-[2.5px] border-border-muted rounded-2xl text-xs font-black tracking-widest text-text-secondary uppercase opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock size={15} />
              Locked • Complete Prerequisite First
            </button>
          ) : isCompleted || isMastered ? (
            <button
              type="button"
              onClick={() => onStartChallenge(level)}
              disabled={isStarting}
              className="w-full py-3.5 bg-secondary text-text-primary border-[3px] border-border rounded-2xl text-xs font-black tracking-widest uppercase shadow-[0_4px_0_#141827] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#141827] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} />
              {isStarting ? "Loading Challenge..." : "Practice Again (Level Retry)"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStartChallenge(level)}
              disabled={isStarting}
              className="w-full py-3.5 bg-primary text-text-primary border-[3px] border-border rounded-2xl text-xs font-black tracking-widest uppercase shadow-[0_4px_0_#141827] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#141827] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={15} />
              {isStarting ? "Starting Challenge..." : "Start Challenge"}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
