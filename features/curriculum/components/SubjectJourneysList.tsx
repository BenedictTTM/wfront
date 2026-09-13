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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {subjects.map((subj) => {
          const isActive = subj.slug === activeSubjectSlug;

          return (
            <div
              key={subj.id}
              className={[
                "flex items-center justify-between p-4 bg-surface border-[2px] rounded-xl transition-all",
                isActive
                  ? "border-border shadow-[0_4px_0_rgba(20,24,39,0.9)] ring-1 ring-primary/40"
                  : "border-border/60 hover:border-border shadow-[0_2px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5",
              ].join(" ")}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={[
                    "w-10 h-10 rounded-xl border-[2px] border-border flex items-center justify-center shrink-0 shadow-xs",
                    isActive ? "bg-primary" : "bg-primary/15",
                  ].join(" ")}
                >
                  <BookOpen size={18} className="text-text-primary" />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-text-primary truncate">
                      {subj.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 bg-primary/20 border border-border text-[9px] font-black rounded text-text-primary uppercase tracking-wider flex items-center gap-0.5">
                        <Check size={10} className="stroke-[3]" /> Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wide">
                    {subj.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onSelectSubject && !isActive && (
                  <button
                    type="button"
                    onClick={() => onSelectSubject(subj)}
                    className="px-2.5 py-1 text-[11px] font-bold border border-border rounded-lg bg-surface hover:bg-surface-muted transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                    aria-label={`Set ${subj.name} as active focus`}
                  >
                    Set Focus
                  </button>
                )}

                <Link
                  href={`/study/${subj.slug}`}
                  className="p-2 bg-surface hover:bg-surface-muted border-[2px] border-border rounded-lg text-text-primary transition-all active:translate-y-0.5 flex items-center gap-1 text-xs font-black"
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
