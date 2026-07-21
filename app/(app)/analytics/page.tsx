"use client";

import React from "react";
import { useStats } from "@/components/providers/stats-provider";

export default function AnalyticsPage() {
  const { addXp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-2xl font-extrabold">Explore & Analytics</h2>
      <p className="text-sm text-text-secondary">
        Analyze your performance data and subscribe to new syllabus subjects or prep tracks.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Core Maths", "Integrated Science", "Social Studies", "General English"].map((track) => (
          <div key={track} className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_4px_0_#141827] flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm">{track}</h4>
              <p className="text-xs text-text-secondary">WASSCE Complete Syllabus</p>
            </div>
            <button
              onClick={() => addXp(12, `Subscribed to ${track}`)}
              className="px-3 py-1.5 bg-[#FFFDF6] hover:bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2px_0_#141827] transition-all cursor-pointer"
            >
              ENROLL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
