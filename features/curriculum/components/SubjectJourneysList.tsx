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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {subjects.map((subj) => {
          const isActive = subj.slug === activeSubjectSlug;

          return (
            <div
              key={subj.id}
              className={[
                "flex items-center justify-between p-2.5 sm:p-3 bg-surface rounded-xl transition-all gap-2",
                isActive
                  ? "border-2.5 border-border shadow-offset ring-2 ring-primary/60"
                  : "border-2 border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 hover:shadow-offset",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div
                  className={[
                    "w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-lg border-2 border-border flex items-center justify-center shrink-0 shadow-[0_1.5px_0_#141827]",
                    isActive ? "bg-primary" : "bg-secondary/40",
                  ].join(" ")}
                >
                  <BookOpen size={16} className="text-text-primary stroke-[2.5]" />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-xs sm:text-[13px] text-text-primary truncate">
                      {subj.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 bg-primary border-[1.5px] border-border text-[8px] font-black rounded-md text-text-primary uppercase tracking-wider flex items-center gap-0.5 shadow-[0_1px_0_#141827] shrink-0">
                        <Check size={9} className="stroke-[3]" /> Active
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-wider">
                    {subj.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onSelectSubject && !isActive && (
                  <button
                    type="button"
                    onClick={() => onSelectSubject(subj)}
                    className="px-2 py-1 text-[10px] font-black border-[1.5px] border-border rounded-lg bg-surface hover:bg-bg-primary shadow-[0_1px_0_#141827] active:translate-y-0.5 transition-all text-text-secondary hover:text-text-primary cursor-pointer"
                    aria-label={`Set ${subj.name} as active focus`}
                  >
                    Focus
                  </button>
                )}

                <Link
                  href={`/study/${subj.slug}`}
                  className="px-2.5 py-1 bg-surface hover:bg-primary border-2 border-border rounded-lg text-text-primary shadow-[0_1.5px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-1 text-xs font-black cursor-pointer"
                  aria-label={`View ${subj.name} full learning path`}
                >
                  <span className="hidden sm:inline">PATH</span>
                  <ChevronRight size={13} className="stroke-[3]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
