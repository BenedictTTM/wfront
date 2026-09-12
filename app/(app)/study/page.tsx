"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Zap, ChevronRight, Loader2 } from "lucide-react";
import { useSubjects } from "@/features/curriculum/hooks";

export default function StudyCenterPage() {
  const { data: subjects, isLoading } = useSubjects();

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-text-primary">Study Center</h2>
        <p className="text-sm text-text-secondary font-medium">
          Choose a subject to start your learning path, or jump straight into practice.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4">
        <Link
          href="/study/quiz"
          className="p-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] transition-all flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)] shrink-0">
              <Zap size={20} className="fill-text-primary text-text-primary" />
            </div>
            <div>
              <h3 className="font-black text-text-primary text-sm">Practice Quiz</h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Quick random questions across any subject or topic
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-primary flex items-center gap-1 shrink-0">
            START QUIZ <ChevronRight size={12} />
          </span>
        </Link>
      </div>

      {/* Learning paths by subject */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">
          Learning Paths
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs font-bold">Loading subjects…</span>
          </div>
        ) : !subjects || subjects.length === 0 ? (
          <div className="p-6 bg-bg-primary border-[2px] border-border rounded-xl text-center text-xs font-bold text-text-secondary">
            No subjects available yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {subjects.map((subj) => (
              <Link
                key={subj.id}
                href={`/study/${subj.slug}`}
                className="flex items-center justify-between p-4 bg-surface border-[2px] border-border rounded-xl shadow-[0_3px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 border-[2px] border-border flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-text-primary" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-text-primary">{subj.name}</span>
                    <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wide">
                      {subj.code}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-secondary shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
