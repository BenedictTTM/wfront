"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { EmptyState, ErrorState } from "@/components/shared";
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
    <ErrorState
      title="Unable to Load Learning Journey"
      message={error?.message || "There was a problem retrieving your curriculum map."}
      onRetry={onRetry}
      retryText="Try Again"
      secondaryAction={
        <Link
          href="/study"
          className="px-4 py-2 bg-surface-muted border-[2px] border-border rounded-xl text-xs font-black hover:bg-border-muted/40 active:translate-y-0.5 transition-all"
        >
          Return to Study
        </Link>
      }
    />
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function JourneyEmptyState() {
  return (
    <EmptyState
      icon={<Compass size={28} className="text-text-secondary" />}
      title="Curriculum Under Construction"
      description="This subject does not have an active structured journey yet. Practice quizzes remain available."
      actionText="Back to Study Center"
      actionHref="/study"
    />
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
  }, [allLevels, journey]);

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
        error={error}
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
