"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, Star, Zap } from "lucide-react";
import { Subject, SubjectJourney } from "../types";
import { useStartJourneyNodeSession } from "../journey-hooks";
import { useCreateQuizAttempt } from "@/features/quiz/hooks";

interface ContinueJourneyCardProps {
  subject: Subject;
  journey: SubjectJourney;
}

export function ContinueJourneyCard({ subject, journey }: ContinueJourneyCardProps) {
  // Locate current node: prioritize unlocked/available nodes
  const allNodes = journey.units.flatMap((u) => u.nodes);
  const explicitCurrent = journey.currentNodeId
    ? allNodes.find((n) => n.id === journey.currentNodeId)
    : null;
  const currentNode =
    (explicitCurrent && explicitCurrent.status !== "LOCKED" ? explicitCurrent : null) ||
    allNodes.find((n) => n.status === "UNLOCKED") ||
    allNodes.find((n) => n.status === "COMPLETED") ||
    allNodes[0];

  const currentUnit =
    journey.units.find((u) => u.id === currentNode?.unitId) ||
    journey.units[0];

  const totalNodes = journey.totalNodes || allNodes.length || 1;
  const completedNodes = journey.completedNodes || 0;
  const percentComplete = Math.min(100, Math.round((completedNodes / totalNodes) * 100));
  const xpAvailable = currentNode?.xpReward ?? 50;

  const router = useRouter();
  const [isStarting, setIsStarting] = React.useState(false);
  const startNodeSessionMutation = useStartJourneyNodeSession();
  const createAttemptMutation = useCreateQuizAttempt();

  // Link destination: directly launch quiz session for current subtopic or navigate to subject journey map
  const activeSubtopicId = currentNode?.subtopicId || currentNode?.id;
  const continueHref = activeSubtopicId
    ? `/study/quiz?subjectId=${subject.id}&subtopicId=${activeSubtopicId}&mode=quiz`
    : `/study/${subject.slug}`;

  const handleContinueJourney = async () => {
    if (isStarting) return;

    if (!currentNode?.id && !activeSubtopicId) {
      router.push(`/study/${subject.slug}`);
      return;
    }

    setIsStarting(true);
    try {
      let attemptId: string | undefined;

      // 1. Try starting via dedicated journey node session endpoint
      if (currentNode?.id) {
        try {
          const res = await startNodeSessionMutation.mutateAsync(currentNode.id);
          if (res?.attemptId) {
            attemptId = res.attemptId;
          }
        } catch (nodeErr) {
          console.warn("startJourneyNodeSession fallback:", nodeErr);
        }
      }

      // 2. Fallback to standard quiz attempt creation
      if (!attemptId) {
        const attempt = await createAttemptMutation.mutateAsync({
          mode: "PRACTICE",
          subjectId: subject.id,
          subtopicId: currentNode?.subtopicId || activeSubtopicId || undefined,
        });
        if (attempt?.id) {
          attemptId = attempt.id;
        }
      }

      if (attemptId) {
        router.push(`/study/quiz?attemptId=${attemptId}&mode=quiz`);
      } else {
        router.push(continueHref);
      }
    } catch (err: unknown) {
      console.error("Failed to start journey session:", err);
      // Fallback navigate to quiz with params so quiz page can handle it
      router.push(continueHref);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section aria-labelledby="continue-journey-heading" className="w-full">
      <div className="bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header pill & Subject indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-[2px] border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-primary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary shadow-[0_2px_0_#141827]">
              Next Recommended Step
            </span>
            <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
              <BookOpen size={14} />
              {subject.name}
            </span>
          </div>

          <span className="px-2 py-0.5 bg-surface-muted border-[2px] border-border rounded-md text-[10px] font-black text-text-primary uppercase tracking-wide">
            {subject.code}
          </span>
        </div>

        {/* Current Objective Details */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
            {currentUnit?.title || "Active Unit"}
          </span>
          <h2
            id="continue-journey-heading"
            className="text-xl md:text-2xl font-black text-text-primary tracking-tight"
          >
            {currentNode?.title || "Continue Learning Path"}
          </h2>
          {currentNode?.description && (
            <p className="text-xs md:text-sm text-text-secondary font-medium mt-0.5">
              {currentNode.description}
            </p>
          )}
        </div>

        {/* Progress & Mastery Metrics */}
        <div className="flex flex-col gap-2.5 bg-surface-muted/80 p-4 border-[2.5px] border-border rounded-xl shadow-inner">
          <div className="flex justify-between items-center text-xs font-black text-text-primary">
            <span>Journey Progress</span>
            <span className="text-text-secondary font-bold">
              {completedNodes} / {totalNodes} Steps ({percentComplete}%)
            </span>
          </div>

          <div
            className="w-full h-3.5 border-[2px] border-border rounded-full bg-surface overflow-hidden p-0.5"
            role="progressbar"
            aria-valuenow={percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Subject journey completion percentage"
          >
            <div
              className="h-full bg-primary border-[1.5px] border-border rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(percentComplete, 4)}%` }}
            />
          </div>

          {/* Badges: Mastery & XP */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-text-primary bg-surface px-3 py-1.5 border-[2px] border-border rounded-xl shadow-[0_2px_0_#141827]">
              <Star size={14} className="fill-[#F6D86B] text-[#141827] stroke-[2.5]" />
              <span>
                {journey.overallMasteryPercent > 0
                  ? `${journey.overallMasteryPercent}% Mastery`
                  : "0% Mastery"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-text-primary bg-surface px-3 py-1.5 border-[2px] border-border rounded-xl shadow-[0_2px_0_#141827]">
              <Zap size={14} className="fill-text-primary text-text-primary stroke-[2]" />
              <span>+{xpAvailable} XP Reward</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleContinueJourney}
            disabled={isStarting}
            className="flex-1 py-3.5 px-6 bg-primary text-text-primary border-[3px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_4px_0_#141827] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#141827] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all flex items-center justify-center gap-2 tracking-wider cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <Loader2 size={16} className="animate-spin stroke-[3]" />
                <span>STARTING QUIZ…</span>
              </>
            ) : (
              <>
                <span>CONTINUE JOURNEY</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </>
            )}
          </button>

          <Link
            href={`/study/${subject.slug}`}
            className="py-3.5 px-5 bg-surface hover:bg-bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all text-center tracking-wider"
          >
            VIEW FULL MAP
          </Link>
        </div>
      </div>
    </section>
  );
}
