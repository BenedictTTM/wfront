"use client";

import React from "react";
import { useStats } from "@/components/providers/stats-provider";
import { Trophy, Star } from "lucide-react";

export default function AchievementsPage() {
  const { xp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      <h2 className="text-2xl font-extrabold flex items-center gap-2">
        <Trophy className="text-[#FF9E2C]" />
        <span>Your Achievements</span>
      </h2>
      <p className="text-sm text-text-secondary">
        Track your learning milestones and rewards gained from study sessions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Achievement 1 */}
        <div className="p-5 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center text-[#FF9E2C] shrink-0">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-text-primary">First Scholar Steps</h4>
            <p className="text-xs text-text-secondary mt-1">Unlock your first 15 XP through active study.</p>
            <span className="inline-block mt-2 text-[10px] font-extrabold bg-[#FBF9F3] border border-border px-2 py-0.5 rounded-full text-green-600">
              {xp >= 15 ? "UNLOCKED" : "IN PROGRESS"}
            </span>
          </div>
        </div>

        {/* Achievement 2 */}
        <div className="p-5 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-[#F0EBE0] border-2 border-border flex items-center justify-center text-text-secondary shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-text-primary">Ranking Challenger</h4>
            <p className="text-xs text-text-secondary mt-1">Reach 30 XP to unlock the scholar leaderboard rankings.</p>
            <span className={`inline-block mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              xp >= 30 
                ? "bg-[#FBF9F3] border-border text-green-600" 
                : "bg-surface-muted border-border-muted text-text-secondary"
            }`}>
              {xp >= 30 ? "UNLOCKED" : "LOCKED"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
