"use client";

import React from "react";
import { useStats } from "@/components/providers/stats-provider";
import Link from "next/link";
import { ClipboardList, Award, ArrowLeft } from "lucide-react";

export default function MockExamsPage() {
  const { addXp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <Link
          href="/study"
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Back to Study Center</span>
        </Link>
      </div>

      <h2 className="text-2xl font-extrabold">WASSCE Mock Exams</h2>

      {/* Main Mock Exam Panel */}
      <div className="p-6 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col gap-4">
        <div className="w-12 h-12 bg-primary/20 border-2 border-border rounded-xl flex items-center justify-center text-text-primary">
          <Award size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold">WASSCE Exam Simulator</h3>
          <p className="text-sm text-text-secondary mt-1">
            Simulate a full-length, timed WASSCE exam. This will feature past question papers and automatically score your responses at the end.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => addXp(25, "Finished lesson simulator")}
            className="px-5 py-2.5 bg-primary border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all cursor-pointer"
          >
            START EXAM SIMULATION (+25 XP)
          </button>
        </div>
      </div>

      {/* Course Assignments List */}
      <div className="p-6 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col gap-3">
        <div className="flex items-center gap-2 text-text-primary font-bold">
          <ClipboardList size={20} />
          <h3 className="text-md">Course Tasks & Assignments</h3>
        </div>
        <p className="text-sm text-text-secondary">
          No pending teacher assignments found for your current tracks. You are all set!
        </p>
        <div className="mt-2">
          <button
            onClick={() => addXp(10, "Checked assignments")}
            className="px-4 py-2 bg-white border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all cursor-pointer"
          >
            Check Assignment Status (+10 XP)
          </button>
        </div>
      </div>
    </div>
  );
}
