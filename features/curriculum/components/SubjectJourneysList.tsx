"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Check } from "lucide-react";
import { Subject } from "../types";

interface SubjectJourneysListProps {
  subjects: Subject[];
  activeSubjectSlug: string;
  onSelectSubject?: (subject: Subject) => void;
}

export function SubjectJourneysList({
  subjects,
  activeSubjectSlug,
  onSelectSubject,
}: SubjectJourneysListProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-8 bg-surface border-[2px] border-border rounded-2xl text-center flex flex-col items-center gap-2">
        <BookOpen size={28} className="text-text-secondary" />
        <h4 className="text-sm font-black text-text-primary">No Subjects Found</h4>
        <p className="text-xs text-text-secondary">
          No WASSCE curriculum subjects are available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="all-subjects-heading" className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3
          id="all-subjects-heading"
          className="text-xs font-black uppercase tracking-widest text-text-secondary"
        >
          Your Subject Journeys
        </h3>
        <span className="text-[11px] font-bold text-text-secondary">
          {subjects.length} Subjects
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subj) => {
          const isActive = subj.slug === activeSubjectSlug;

          return (
            <div
              key={subj.id}
              className={[
                "flex items-center justify-between p-3 sm:p-4 bg-surface rounded-2xl transition-all gap-2.5",
                isActive
                  ? "border-[3px] border-border shadow-[0_5px_0_rgba(20,24,39,0.9)] ring-2 ring-primary/60"
                  : "border-[2.5px] border-border shadow-[0_3px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_rgba(20,24,39,0.9)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                <div
                  className={[
                    "w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-[2.5px] border-border flex items-center justify-center shrink-0 shadow-[0_2px_0_#141827]",
                    isActive ? "bg-primary" : "bg-secondary/40",
                  ].join(" ")}
                >
                  <BookOpen size={18} className="text-text-primary stroke-[2.5]" />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-black text-xs sm:text-sm text-text-primary truncate">
                      {subj.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 sm:px-2 py-0.5 bg-primary border-[1.5px] border-border text-[8px] sm:text-[9px] font-black rounded-md text-text-primary uppercase tracking-wider flex items-center gap-0.5 shadow-[0_1px_0_#141827] shrink-0">
                        <Check size={10} className="stroke-[3]" /> Active
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-wider">
                    {subj.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {onSelectSubject && !isActive && (
                  <button
                    type="button"
                    onClick={() => onSelectSubject(subj)}
                    className="px-2.5 py-1.5 text-[11px] font-black border-[2px] border-border rounded-xl bg-surface hover:bg-bg-primary shadow-[0_1.5px_0_#141827] active:translate-y-0.5 transition-all text-text-secondary hover:text-text-primary cursor-pointer"
                    aria-label={`Set ${subj.name} as active focus`}
                  >
                    Focus
                  </button>
                )}

                <Link
                  href={`/study/${subj.slug}`}
                  className="px-3 py-1.5 bg-surface hover:bg-primary border-[2px] border-border rounded-xl text-text-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center gap-1 text-xs font-black cursor-pointer"
                  aria-label={`View ${subj.name} full learning path`}
                >
                  <span className="hidden sm:inline">PATH</span>
                  <ChevronRight size={14} className="stroke-[3]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
