"use client";

import React from "react";
import { Lock } from "lucide-react";
import { useStats } from "@/components/providers/stats-provider";

export default function LeaderboardsPage() {
  const { xp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-2xl font-extrabold">Leaderboard Rankings</h2>
      {xp < 30 ? (
        <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-bg-secondary flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <Lock size={32} className="text-text-secondary" />
          <h3 className="font-extrabold">Leaderboard Locked</h3>
          <p className="text-sm text-text-secondary max-w-xs">
            You need to reach at least 30 XP to unlock rankings. Currently you have {xp} XP. (Tip: complete active cards in feed or quizzes to gain XP)
          </p>
        </div>
      ) : (
        <div className="border-2 border-border bg-surface rounded-xl shadow-offset overflow-hidden animate-in fade-in duration-300">
          <div className="bg-[#FFFDF6] border-b-2 border-border p-4">
            <span className="text-sm font-extrabold text-[#FF9E2C]">WEEKLY RANKINGS</span>
          </div>
          <div className="divide-y-2 divide-border">
            {[
              { rank: 1, name: "Amina Mensah", xp: 120, active: false },
              { rank: 2, name: "niiafotey (You)", xp: xp, active: true },
              { rank: 3, name: "Kofi Owusu", xp: 28, active: false },
              { rank: 4, name: "Sena Tamakloe", xp: 15, active: false }
            ]
              .sort((a, b) => b.xp - a.xp)
              .map((student, idx) => (
                <div
                  key={student.name}
                  className={`flex items-center justify-between p-4 ${student.active ? "bg-primary/20 font-bold" : "font-medium"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-extrabold">{idx + 1}</span>
                    <span className="text-sm">{student.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#E28743]">{student.xp} XP</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
