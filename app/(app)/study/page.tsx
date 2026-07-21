"use client";

import React from "react";
import Link from "next/link";
import { useStats } from "@/components/providers/stats-provider";

export default function StudyCenterPage() {
  const { addXp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-2xl font-extrabold">Study Center</h2>
      <div className="p-6 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col gap-4">
        <span className="text-4xl">📚</span>
        <h3 className="text-lg font-bold">Launch your next Mock Exam</h3>
        <p className="text-sm text-text-secondary">
          Complete official WASSCE style exam papers dynamically generated from your notes and past curriculum documents.
        </p>
        <div className="flex gap-3">
          <Link
            href="/study/quiz"
            className="px-5 py-2.5 bg-primary border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all text-center"
          >
            TAKE PRACTICE QUIZ
          </Link>
          <Link
            href="/study/mock-exams"
            className="px-5 py-2.5 bg-white border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all text-center"
          >
            SIMULATE EXAM PREP
          </Link>
        </div>
      </div>
    </div>
  );
}
