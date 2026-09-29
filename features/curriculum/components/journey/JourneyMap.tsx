// features/curriculum/components/journey/JourneyMap.tsx

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { JourneyLevelItem, LearningJourney } from "../../types";
import { JourneyNode } from "./JourneyNode";
import { JourneyConnector } from "./JourneyConnector";
import { LevelCard } from "./LevelCard";

interface JourneyMapProps {
  journey: LearningJourney;
  onStartChallenge: (level: JourneyLevelItem) => void;
  isStartingChallenge?: boolean;
}

export function JourneyMap({
  journey,
  onStartChallenge,
  isStartingChallenge = false,
}: JourneyMapProps) {
  const [selectedLevel, setSelectedLevel] = useState<JourneyLevelItem | null>(null);
  const currentLevelNodeRef = useRef<HTMLDivElement | null>(null);

  // Flatten all levels to find current level and prerequisites
  const allLevels = useMemo(() => {
    return journey.stages.flatMap((s) => s.levels);
  }, [journey.stages]);

  // Map levels for quick lookup of prerequisite titles
  const levelTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const lvl of allLevels) {
      map.set(lvl.id, lvl.title);
    }
    return map;
  }, [allLevels]);

  // Identify the active/current level
  const currentLevel = useMemo(() => {
    if (journey.currentLevelId) {
      const found = allLevels.find((l) => l.id === journey.currentLevelId);
      if (found) return found;
    }
    return (
      allLevels.find((l) => l.state === "ACTIVE") ||
      allLevels.find((l) => l.state === "AVAILABLE") ||
      allLevels[0] ||
      null
    );
  }, [allLevels, journey.currentLevelId]);

  // Auto-scroll to the active level on initial mount
  useEffect(() => {
    if (currentLevelNodeRef.current) {
      // Delay slightly for render stability
      const timer = setTimeout(() => {
        currentLevelNodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLevel?.id]);

  // Winding serpentine pattern: center -> right -> center -> left
  const pattern: Array<"center" | "right" | "center" | "left"> = [
    "center",
    "right",
    "center",
    "left",
  ];

  let cumulativeLevelIndex = 0;

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      {/* Map Stages */}
      <div className="w-full max-w-xl flex flex-col items-center gap-10">
        {journey.stages.map((stage, stageIndex) => {
          const completedInStage = stage.levels.filter(
            (l) => l.state === "COMPLETED" || l.state === "MASTERED" || l.isCompleted,
          ).length;
          const isStageCompleted =
            stage.levels.length > 0 && completedInStage === stage.levels.length;

          return (
            <section
              key={stage.id}
              aria-label={stage.title}
              className="w-full flex flex-col items-center"
            >
              {/* Stage Milestone Header Banner */}
              <div className="w-full bg-surface border-[3px] border-border rounded-2xl shadow-[0_5px_0_rgba(20,24,39,0.9)] p-4 md:p-5 mb-8 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-surface-muted border-[1.5px] border-border rounded-md text-[10px] font-black uppercase tracking-wider text-text-secondary">
                      Chapter {stageIndex + 1}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-text-primary">
                      {stage.title}
                    </h3>
                  </div>

                  {isStageCompleted ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-secondary border border-border rounded-full text-[10px] font-black text-text-primary">
                      <CheckCircle2 size={12} className="stroke-[2.5]" />
                      Mastered
                    </span>
                  ) : (
                    <span className="text-xs font-black text-text-secondary">
                      {completedInStage} / {stage.levels.length} Done
                    </span>
                  )}
                </div>

                {stage.description && (
                  <p className="text-xs text-text-secondary font-medium">
                    {stage.description}
                  </p>
                )}

                {/* Stage Progress Bar Dots */}
                <div className="flex gap-1 pt-1">
                  {stage.levels.map((lvl) => {
                    const done =
                      lvl.state === "COMPLETED" ||
                      lvl.state === "MASTERED" ||
                      lvl.isCompleted;
                    return (
                      <div
                        key={lvl.id}
                        className={[
                          "flex-1 h-2 rounded-full border border-border transition-colors duration-300",
                          done ? "bg-secondary" : "bg-surface-muted",
                        ].join(" ")}
                        title={`${lvl.title}: ${lvl.state}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Serpentine Level Progression Path */}
              <div className="w-full flex flex-col items-center">
                {stage.levels.map((level, levelIdx) => {
                  const globalIdx = cumulativeLevelIndex++;
                  const currentOffset = pattern[globalIdx % pattern.length];
                  const nextOffset = pattern[(globalIdx + 1) % pattern.length];

                  const isLevelCurrent = level.id === currentLevel?.id;
                  const isLevelCompleted =
                    level.state === "COMPLETED" ||
                    level.state === "MASTERED" ||
                    level.isCompleted;

                  return (
                    <React.Fragment key={level.id}>
                      {/* Node in Winding Path */}
                      <div
                        ref={isLevelCurrent ? currentLevelNodeRef : null}
                        className="w-full"
                      >
                        <JourneyNode
                          level={level}
                          index={globalIdx}
                          isCurrent={isLevelCurrent}
                          onSelect={(lvl) => setSelectedLevel(lvl)}
                          offsetPosition={currentOffset}
                        />
                      </div>

                      {/* Connecting Path to Next Node */}
                      {levelIdx < stage.levels.length - 1 && (
                        <JourneyConnector
                          completed={isLevelCompleted}
                          active={isLevelCurrent}
                          fromOffset={currentOffset}
                          toOffset={nextOffset}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Stage Finale Milestone / Gate */}
              <div className="my-6 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-muted border-[2.5px] border-border flex items-center justify-center shadow-[0_3px_0_#141827]">
                  <Flag size={20} className="text-text-secondary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  Chapter {stageIndex + 1} Checkpoint
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {/* Interactive Level Detail Modal */}
      {selectedLevel && (
        <LevelCard
          level={selectedLevel}
          isOpen={!!selectedLevel}
          isCurrent={selectedLevel.id === currentLevel?.id}
          stageTitle={
            journey.stages.find((s) => s.id === selectedLevel.stageId)?.title
          }
          prerequisiteTitle={
            selectedLevel.prerequisiteLevelId
              ? levelTitleMap.get(selectedLevel.prerequisiteLevelId) || null
              : null
          }
          prerequisiteLevel={
            selectedLevel.prerequisiteLevelId
              ? allLevels.find((l) => l.id === selectedLevel.prerequisiteLevelId) || null
              : null
          }
          subjectId={journey.subjectId}
          onClose={() => setSelectedLevel(null)}
          onStartChallenge={(lvl) => {
            setSelectedLevel(null);
            onStartChallenge(lvl);
          }}
          isStarting={isStartingChallenge}
        />
      )}
    </div>
  );
}
