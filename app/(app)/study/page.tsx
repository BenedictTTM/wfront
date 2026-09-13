"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, BookOpen, RefreshCw } from "lucide-react";
import { useSubjects } from "@/features/curriculum/hooks";
import { useSubjectJourney } from "@/features/curriculum/journey-hooks";
import {
  ContinueJourneyCard,
  PlayModesSection,
  SubjectJourneysList,
  StudyCenterSkeleton,
} from "@/features/curriculum/components";
import { Subject } from "@/features/curriculum/types";

export default function StudyCenterPage() {
  const {
    data: subjects,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Initialize selected subject once subjects load
  useEffect(() => {
    if (subjects && subjects.length > 0 && !selectedSubject) {
      try {
        const savedSlug = localStorage.getItem("panda_active_subject_slug");
        const found = subjects.find((s) => s.slug === savedSlug);
        setSelectedSubject(found || subjects[0]);
      } catch {
        setSelectedSubject(subjects[0]);
      }
    }
  }, [subjects, selectedSubject]);

  const activeSlug = selectedSubject?.slug ?? "";
  const {
    data: journey,
    isLoading: isLoadingJourney,
    isError: isJourneyError,
    refetch: refetchJourney,
  } = useSubjectJourney(activeSlug);

  const handleSelectSubject = (subj: Subject) => {
    setSelectedSubject(subj);
    try {
      localStorage.setItem("panda_active_subject_slug", subj.slug);
    } catch {
      // Ignore localStorage restrictions
    }
  };

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoadingSubjects || (selectedSubject && isLoadingJourney)) {
    return <StudyCenterSkeleton />;
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (isSubjectsError || !subjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border-[2px] border-border flex items-center justify-center text-destructive">
          <AlertCircle size={28} />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <h2 className="text-lg font-black text-text-primary">
            Unable to Load Study Center
          </h2>
          <p className="text-xs text-text-secondary font-medium">
            {subjectsError instanceof Error
              ? subjectsError.message
              : "A network error occurred while loading curriculum data."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetchSubjects()}
          className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          RETRY
        </button>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (subjects.length === 0) {
    return (
      <div className="p-10 bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] text-center flex flex-col items-center gap-4 max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
          <BookOpen size={28} className="text-text-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black text-text-primary">No Curriculum Available</h2>
          <p className="text-xs text-text-secondary">
            Curriculum subjects are currently being prepared. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-2 max-w-3xl mx-auto w-full">
      {/* ─── Page Title Header ────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Study
        </h1>
        <p className="text-xs md:text-sm text-text-secondary font-medium">
          Continue your guided WASSCE journey, compete in live speed rounds, or practice at your own pace.
        </p>
      </header>

      {/* ─── 1. CONTINUE JOURNEY (Primary Recommended Next Step) ──────────────── */}
      {selectedSubject && journey ? (
        <ContinueJourneyCard subject={selectedSubject} journey={journey} />
      ) : selectedSubject && isJourneyError ? (
        <div className="p-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-black text-text-primary">
              Ready to study {selectedSubject.name}?
            </span>
            <span className="text-[11px] text-text-secondary">
              Open the full journey map to select your starting checkpoint.
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetchJourney()}
            className="px-3.5 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shrink-0 shadow-[0_2px_0_#141827] cursor-pointer"
          >
            RETRY JOURNEY
          </button>
        </div>
      ) : null}

      {/* ─── 2. PLAY (Multiplayer & Quick Practice) ───────────────────────────── */}
      <PlayModesSection />

      {/* ─── 3. YOUR JOURNEYS / SUBJECTS ───────────────────────────────────────── */}
      <SubjectJourneysList
        subjects={subjects}
        activeSubjectSlug={selectedSubject?.slug ?? ""}
        onSelectSubject={handleSelectSubject}
      />
    </div>
  );
}
