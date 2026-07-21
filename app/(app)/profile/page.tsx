"use client";

import React from "react";
import { useStats } from "@/components/providers/stats-provider";

export default function StudentProfilePage() {
  const { xp, gems, streak, completedQuizzes } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      <h2 className="text-2xl font-extrabold">Student Profile</h2>
      
      {/* Profile Card */}
      <div className="border-2 border-border bg-surface rounded-xl p-6 shadow-offset flex items-center gap-6">
        <div className="w-16 h-16 rounded-full border-3 border-border bg-emerald-500 flex items-center justify-center font-extrabold text-white text-3xl select-none">
          N
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-extrabold">niiafotey</h3>
          <span className="text-xs font-bold text-text-secondary">WASSCE Student Candidate</span>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs font-bold bg-[#FBF9F3] border border-border px-2 py-0.5 rounded-full text-[#E28743]" title="Total XP">
              XP: {xp}
            </span>
            <span className="text-xs font-bold bg-[#FBF9F3] border border-border px-2 py-0.5 rounded-full text-blue-500" title="Gems balance">
              Gems: {gems}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">Active Streak</span>
          <span className="text-2xl font-extrabold text-red-500">🔥 {streak} Days</span>
        </div>
        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">Quizzes Completed</span>
          <span className="text-2xl font-extrabold text-blue-500">⭐ {completedQuizzes} Quizzes</span>
        </div>
        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">Rankings Standing</span>
          <span className="text-2xl font-extrabold text-[#E28743]">
            {xp >= 30 ? "Rank #2" : "Locked (<30 XP)"}
          </span>
        </div>
      </div>
    </div>
  );
}
