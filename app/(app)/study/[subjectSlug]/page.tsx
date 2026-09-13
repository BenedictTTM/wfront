"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Compass,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useLearningJourney } from "@/features/curriculum/journey-hooks";
import {
  JourneyMap,
  JourneyProgress,
} from "@/features/curriculum/components/journey";
import { JourneyLevelItem } from "@/features/curriculum/types";

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function JourneyLoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-4 animate-pulse">
      {/* Progress HUD Skeleton */}
      <div className="w-full bg-surface border-[3px] border-border rounded-3xl p-6 flex flex-col gap-4 shadow-[0_6px_0_rgba(20,24,39,0.9)]">
        <div className="h-5 w-48 bg-surface-muted rounded-md" />
        <div className="h-3 w-full bg-surface-muted rounded-full" />
        <div className="h-12 w-full bg-surface-muted rounded-2xl" />
      </div>

      {/* Stage Banner Skeleton */}
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl p-5 shadow-[0_5px_0_rgba(20,24,39,0.9)]">
        <div className="h-5 w-40 bg-surface-muted rounded-md mb-2" />
        <div className="h-3 w-64 bg-surface-muted rounded-md" />
      </div>

      {/* Nodes Winding Skeleton */}
      <div className="flex flex-col items-center gap-8 py-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={[
              "w-20 h-20 rounded-3xl border-[3.5px] border-border-muted bg-surface-muted shadow-[0_6px_0_#D8D8D8]",
              i % 2 === 0 ? "-translate-x-12" : "translate-x-12",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────

function JourneyErrorState({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto my-12 bg-surface border-[3px] border-border rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-[0_6px_0_rgba(20,24,39,0.9)]">
      <div className="w-14 h-14 rounded-2xl bg-red-100 border-[2px] border-border flex items-center justify-center text-destructive">
        <AlertCircle size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black text-text-primary">
          Unable to Load Learning Journey
        </h3>
        <p className="text-xs text-text-secondary">
          {error?.message || "There was a problem retrieving your curriculum map."}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <Link
          href="/study"
          className="px-4 py-2 bg-surface-muted border-[2px] border-border rounded-xl text-xs font-black hover:bg-border-muted/40 active:translate-y-0.5 transition-all"
        >
          Return to Study
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function JourneyEmptyState() {
  return (
    <div className="w-full max-w-md mx-auto my-12 bg-surface border-[3px] border-border rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-[0_6px_0_rgba(20,24,39,0.9)]">
      <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
        <Compass size={28} className="text-text-secondary" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black text-text-primary">
          Curriculum Under Construction
        </h3>
        <p className="text-xs text-text-secondary">
          This subject does not have an active structured journey yet. Practice quizzes remain available.
        </p>
      </div>

      <Link
        href="/study"
        className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all"
      >
        Back to Study Center
      </Link>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function SubjectJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const subjectSlug = (params?.subjectSlug as string) || "";

  const {
    data: journey,
    isLoading,
    isError,
    error,
    refetch,
  } = useLearningJourney(subjectSlug);

  // Flatten all levels to find current level
  const allLevels = useMemo(() => {
    return journey?.stages.flatMap((s) => s.levels) || [];
  }, [journey?.stages]);

  const currentLevel = useMemo(() => {
    if (journey?.currentLevelId) {
      const found = allLevels.find((l) => l.id === journey.currentLevelId);
      if (found) return found;
    }
    return (
      allLevels.find((l) => l.state === "ACTIVE") ||
      allLevels.find((l) => l.state === "AVAILABLE") ||
      allLevels[0] ||
      null
    );
  }, [allLevels, journey?.currentLevelId]);

  // Navigate to challenge
  const handleStartChallenge = (level: JourneyLevelItem) => {
    if (level.state === "LOCKED") {
      toast.error("This level is locked. Complete the prerequisite level first.");
      return;
    }

    // Launch quiz challenge for this level
    const targetUrl = level.subtopicId
      ? `/study/quiz?subtopicId=${level.subtopicId}&subjectId=${journey?.subjectId}&levelId=${level.id}&mode=quiz`
      : `/study/quiz?subjectId=${journey?.subjectId}&levelId=${level.id}&mode=quiz`;

    router.push(targetUrl);
  };

  if (isLoading) {
    return <JourneyLoadingSkeleton />;
  }

  if (isError || !journey) {
    return (
      <JourneyErrorState
        error={error as Error}
        onRetry={() => refetch()}
      />
    );
  }

  if (journey.stages.length === 0 || allLevels.length === 0) {
    return <JourneyEmptyState />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-4 pb-24">
      {/* Sticky Progress HUD Header */}
      <JourneyProgress
        subjectName={journey.subjectName}
        subjectSlug={journey.subjectSlug}
        completedLevels={journey.completedLevels}
        totalLevels={journey.totalLevels}
        masteredLevels={journey.masteredLevels}
        completionPercentage={journey.completionPercentage}
        totalXpEarned={journey.completedLevels * 50 + journey.masteredLevels * 25}
        currentLevel={currentLevel}
        onContinueCurrent={
          currentLevel ? () => handleStartChallenge(currentLevel) : undefined
        }
      />

      {/* Winding Game Progression Canvas */}
      <main aria-label={`${journey.subjectName} Learning Progression Map`}>
        <JourneyMap
          journey={journey}
          onStartChallenge={handleStartChallenge}
        />
      </main>
    </div>
  );
}
