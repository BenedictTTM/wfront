// features/curriculum/components/journey/MasteryIndicator.tsx

import React from "react";
import { Star } from "lucide-react";

interface MasteryIndicatorProps {
  stars: number; // 0 to 3
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  isMastered?: boolean;
}

export function MasteryIndicator({
  stars,
  size = "md",
  showLabel = false,
  isMastered = false,
}: MasteryIndicatorProps) {
  const starSizes = {
    sm: 12,
    md: 16,
    lg: 22,
  };

  const starSize = starSizes[size];

  const getLabel = () => {
    if (isMastered || stars >= 3) return "Mastered";
    if (stars === 2) return "Proficient";
    if (stars === 1) return "Passed";
    return "Not Started";
  };

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`Mastery: ${stars} of 3 stars`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((starIndex) => {
          const isFilled = starIndex <= stars;
          return (
            <Star
              key={starIndex}
              size={starSize}
              className={[
                "transition-all duration-300",
                isFilled
                  ? "fill-amber-400 text-border stroke-[2] drop-shadow-[0_1px_0_rgba(20,24,39,0.8)]"
                  : "fill-surface-muted text-border-muted stroke-[1.5] opacity-50",
              ].join(" ")}
            />
          );
        })}
      </div>

      {showLabel && (
        <span
          className={[
            "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border-[1.5px] border-border",
            isMastered || stars >= 3
              ? "bg-amber-300 text-text-primary shadow-[0_1px_0_#141827]"
              : stars > 0
              ? "bg-secondary text-text-primary"
              : "bg-surface-muted text-text-secondary opacity-75",
          ].join(" ")}
        >
          {getLabel()}
        </span>
      )}
    </div>
  );
}
