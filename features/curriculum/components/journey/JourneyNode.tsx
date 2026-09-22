// features/curriculum/components/journey/JourneyNode.tsx

import React from "react";
import Image from "next/image";
import {
  Atom,
  Binary,
  BookOpen,
  Brain,
  Calculator,
  Check,
  Compass,
  Crown,
  Dna,
  Dumbbell,
  FileText,
  Flame,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  Lightbulb,
  Lock,
  Microscope,
  PenTool,
  PieChart,
  RotateCcw,
  Scale,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { JourneyLevelItem, LevelProgressState } from "../../types";
import { MasteryIndicator } from "./MasteryIndicator";

interface StrategicIconConfig {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// Curated pool of 30 distinct, recognizable educational and gaming icons
const JOURNEY_ICONS: StrategicIconConfig[] = [
  { Icon: Calculator, strokeWidth: 2.2 },
  { Icon: Brain, strokeWidth: 2.2 },
  { Icon: Zap, strokeWidth: 2.2 },
  { Icon: BookOpen, strokeWidth: 2.2 },
  { Icon: Atom, strokeWidth: 2.2 },
  { Icon: Target, strokeWidth: 2.2 },
  { Icon: FlaskConical, strokeWidth: 2.2 },
  { Icon: Lightbulb, strokeWidth: 2.2 },
  { Icon: Compass, strokeWidth: 2.2 },
  { Icon: Dna, strokeWidth: 2.2 },
  { Icon: Flame, strokeWidth: 2.2 },
  { Icon: Trophy, strokeWidth: 2.2 },
  { Icon: PenTool, strokeWidth: 2.2 },
  { Icon: PieChart, strokeWidth: 2.2 },
  { Icon: Sparkles, strokeWidth: 2.2 },
  { Icon: Globe, strokeWidth: 2.2 },
  { Icon: Dumbbell, strokeWidth: 2.2 },
  { Icon: Binary, strokeWidth: 2.2 },
  { Icon: GraduationCap, strokeWidth: 2.2 },
  { Icon: HeartPulse, strokeWidth: 2.2 },
  { Icon: Crown, strokeWidth: 2.2 },
  { Icon: Scale, strokeWidth: 2.2 },
  { Icon: Leaf, strokeWidth: 2.2 },
  { Icon: Swords, strokeWidth: 2.2 },
  { Icon: TrendingUp, strokeWidth: 2.2 },
  { Icon: Microscope, strokeWidth: 2.2 },
  { Icon: Star, strokeWidth: 2.2 },
  { Icon: Landmark, strokeWidth: 2.2 },
  { Icon: RotateCcw, strokeWidth: 2.2 },
  { Icon: FileText, strokeWidth: 2.2 },
];

/**
 * Resolves a guaranteed unique icon for each button along the path.
 * Every consecutive button gets a different icon based on its journey index.
 */
function getStrategicNodeIcon(level: JourneyLevelItem, nodeIndex: number): StrategicIconConfig {
  const text = `${level.title} ${level.description ?? ""}`.toLowerCase();

  // Milestone boss battle or checkpoint
  if (text.includes("boss") || text.includes("showdown") || text.includes("battle")) {
    return { Icon: Swords, size: 24, strokeWidth: 2.2 };
  }
  if (text.includes("final exam") || text.includes("checkpoint finale")) {
    return { Icon: Trophy, size: 24, strokeWidth: 2.2 };
  }

  // Guaranteed distinct icon per button
  const config = JOURNEY_ICONS[Math.abs(nodeIndex) % JOURNEY_ICONS.length];
  return {
    Icon: config.Icon,
    size: 24,
    strokeWidth: config.strokeWidth ?? 2.2,
    className: config.className ?? "",
  };
}

interface JourneyNodeProps {
  level: JourneyLevelItem;
  index?: number;
  isCurrent: boolean;
  onSelect: (level: JourneyLevelItem) => void;
  offsetPosition?: "left" | "center" | "right";
}

export function JourneyNode({
  level,
  index,
  isCurrent,
  onSelect,
  offsetPosition = "center",
}: JourneyNodeProps) {
  // Determine effective visual state
  const state: LevelProgressState = isCurrent ? "ACTIVE" : level.state;
  const isLocked = state === "LOCKED";
  const isMastered = state === "MASTERED" || level.isMastered;
  const isCompleted = state === "COMPLETED" || isMastered || level.isCompleted;
  const isAvailable = state === "AVAILABLE";
  const isActive = isCurrent || state === "ACTIVE";

  // Use global journey index or orderIndex so every button has a different icon
  const nodeIndex = typeof index === "number" ? index : level.orderIndex ?? 0;

  // Alignment classes for winding serpentine path
  const alignmentClass =
    offsetPosition === "left"
      ? "justify-start pl-6 sm:pl-10"
      : offsetPosition === "right"
      ? "justify-end pr-6 sm:pr-10"
      : "justify-center";

  // State-specific visual styling for the 3D isometric node
  const stateFilterClass = isLocked
    ? "grayscale-[100%] opacity-55 hover:opacity-75"
    : "hover:brightness-95";

  // Strategically resolve distinct hero icon for this specific button
  const {
    Icon: HeroIcon,
    size: iconSize = 24,
    strokeWidth: iconStrokeWidth = 2.2,
    className: iconExtraClass = "",
  } = getStrategicNodeIcon(level, nodeIndex);

  // Asset selection based on completion state
  const baseImgSrc = isCompleted
    ? "/images/journey/buttom-completed.png"
    : "/images/journey/buttom.png";

  const topImgSrc = isCompleted
    ? "/images/journey/top-completed.png"
    : "/images/journey/top.png";

  return (
    <div
      className={`w-full max-w-[280px] sm:max-w-[320px] mx-auto flex items-center relative z-10 py-1 ${alignmentClass}`}
    >
      <div className="flex flex-col items-center group relative">
        {/* "START HERE" Beacon Tag for the current active level */}
        {isActive && (
          <div className="absolute -top-7 z-30 flex items-center gap-1.5 px-2.5 py-0.5 bg-primary border-[2px] border-border rounded-full text-[10px] font-black tracking-wider text-text-primary uppercase shadow-[0_2px_0_#141827] pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>START HERE</span>
          </div>
        )}

        {/* Mastered Crown Beacon */}
        {isMastered && (
          <div className="absolute -top-6 z-30 text-amber-500 pointer-events-none">
            <Crown size={20} className="fill-amber-400 stroke-[2] text-border" />
          </div>
        )}

        {/* Interactive 3D Hexagonal Node Button */}
        <button
          type="button"
          onClick={() => onSelect(level)}
          aria-label={`${level.title} - Status: ${state}`}
          className={[
            "relative flex items-center justify-center outline-none select-none transition-transform duration-150 cursor-pointer",
            "w-[84px] h-[80px]",
            "hover:-translate-y-0.5 active:translate-y-1",
            stateFilterClass,
          ].join(" ")}
        >
          {/* 3D Base Platform Image */}
          <Image
            src={baseImgSrc}
            alt=""
            width={84}
            height={80}
            priority={isActive || level.orderIndex < 3}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          />

          {/* 3D Raised Hexagon Cap Image */}
          <Image
            src={topImgSrc}
            alt=""
            width={72}
            height={51}
            priority={isActive || level.orderIndex < 3}
            className="absolute top-[5px] left-[6px] w-[72px] h-[51px] object-contain pointer-events-none select-none transition-transform duration-150 group-active:translate-y-1"
          />

          {/* Status Corner Indicator Badge (Top-Right) */}
          {isCompleted && !isMastered && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary border-[1.5px] border-border flex items-center justify-center text-text-primary shadow-[0_1.5px_0_#141827] z-20"
              title="Completed"
            >
              <Check size={11} strokeWidth={3} />
            </span>
          )}
          {isLocked && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface border-[1.5px] border-border flex items-center justify-center text-text-secondary shadow-[0_1px_0_#141827] z-20"
              title="Locked"
            >
              <Lock size={10} strokeWidth={2.5} />
            </span>
          )}

          {/* Node Central Hero Icon positioned over the cap */}
          <div className="absolute top-[5px] left-[6px] w-[72px] h-[51px] flex items-center justify-center pointer-events-none z-10 transition-transform duration-150 group-active:translate-y-1">
            <HeroIcon
              size={iconSize}
              strokeWidth={iconStrokeWidth}
              className={[
                isLocked ? "text-text-secondary/60" : "text-text-primary",
                iconExtraClass,
              ].join(" ")}
            />
          </div>

          {/* XP badge on node corner if available */}
          {!isCompleted && !isLocked && (
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-surface border-[1.5px] border-border rounded-md text-[9px] font-black text-text-primary shadow-[0_2px_0_#141827] z-20">
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
