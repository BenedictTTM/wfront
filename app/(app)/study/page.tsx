"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import { safeStorage } from "@/lib/storage";

export default function StudyCenterPage() {
  const {
    data: subjects,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = useMemo(() => {
    if (!Array.isArray(subjects) || subjects.length === 0) return null;
    if (selectedSubjectId) {
      const found = subjects.find((s) => s.id === selectedSubjectId || s.slug === selectedSubjectId);
      if (found) return found;
    }
    const savedSlug = safeStorage.getItemString("panda_active_subject_slug");
    const found = subjects.find((s) => s.slug === savedSlug);
    return found || subjects[0];
  }, [subjects, selectedSubjectId]);

  const activeSlug = selectedSubject?.slug ?? "";
  const {
    data: journey,
    isLoading: isLoadingJourney,
  } = useSubjectJourney(activeSlug);

  const handleSelectSubject = (subj: Subject) => {
    setSelectedSubjectId(subj.id);
    safeStorage.setItem("panda_active_subject_slug", subj.slug);
  };

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoadingSubjects || (selectedSubject && isLoadingJourney)) {
    return <StudyCenterSkeleton />;
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (isSubjectsError || !Array.isArray(subjects)) {
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

      {/* ─── 1. CONTINUE JOURNEY / GUEST STUDY CARD ──────────────────────────── */}
      {selectedSubject && journey ? (
        <ContinueJourneyCard subject={selectedSubject} journey={journey} />
      ) : selectedSubject ? (
        <section aria-labelledby="start-subject-heading" className="w-full">
          <div className="bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-[2px] border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-primary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary shadow-[0_2px_0_#141827]">
                  Curriculum Module
                </span>
                <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                  <BookOpen size={14} />
                  {selectedSubject.name}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-surface-muted border-[2px] border-border rounded-md text-[10px] font-black text-text-primary uppercase tracking-wide">
                {selectedSubject.code}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2
                id="start-subject-heading"
                className="text-xl md:text-2xl font-black text-text-primary tracking-tight"
              >
                {selectedSubject.name} Exam Preparation
              </h2>
              <p className="text-xs md:text-sm text-text-secondary font-medium">
                {selectedSubject.description || "Practice official WASSCE past questions, test your speed, and build topic mastery."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <Link
                href={`/study/quiz?subjectId=${selectedSubject.id}&mode=quiz`}
                className="flex-1 py-3.5 px-6 bg-primary text-text-primary border-[3px] border-border rounded-xl text-xs md:text-sm font-black shadow-[0_4px_0_#141827] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all flex items-center justify-center gap-2 tracking-wider text-center"
              >
                <span>START PRACTICE QUIZ</span>
              </Link>
              <Link
                href={`/study/${selectedSubject.slug}`}
                className="py-3.5 px-5 bg-surface text-text-primary border-[2px] border-border rounded-xl text-xs font-extrabold hover:bg-surface-muted shadow-[0_2px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 transition-all text-center tracking-wide"
              >
                EXPLORE TOPIC MAP
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── 2. PLAY (Multiplayer & Quick Practice) ───────────────────────────── */}
      <PlayModesSection activeSubjectId={selectedSubject?.id} />

      {/* ─── 3. YOUR JOURNEYS / SUBJECTS ───────────────────────────────────────── */}
      <SubjectJourneysList
        subjects={subjects}
        activeSubjectSlug={selectedSubject?.slug ?? ""}
        onSelectSubject={handleSelectSubject}
      />
    </div>
  );
}
