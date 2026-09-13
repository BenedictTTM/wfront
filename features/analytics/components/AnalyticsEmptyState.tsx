// features/analytics/components/AnalyticsEmptyState.tsx

import React from "react";
import Link from "next/link";
import { Sparkles, Target, ArrowRight, BookOpen } from "lucide-react";

export function AnalyticsEmptyState() {
  return (
    <div className="p-8 sm:p-12 bg-surface border-2.5 border-border rounded-3xl shadow-[0_6px_0_#141827] flex flex-col items-center text-center max-w-xl mx-auto my-6 gap-6">
      {/* ── Mascot / Target Illustration ── */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-[#FFF8E7] border-2.5 border-border flex items-center justify-center text-[#FF9E2C] shadow-[0_4px_0_#141827]">
          <Target className="w-10 h-10" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary border-2 border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827]">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl sm:text-2xl font-black text-text-primary">
          Your Performance Dashboard is Waiting
        </h3>
        <p className="text-xs sm:text-sm font-bold text-text-secondary leading-relaxed">
          Complete your first practice quiz or journey challenge to uncover your accuracy,
          identify strong topics, and track your WASSCE exam readiness.
        </p>
      </div>

      {/* ── 3 Highlights ── */}
      <div className="grid grid-cols-3 gap-3 w-full text-left">
        <div className="p-3 bg-bg-secondary rounded-xl border border-border flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase text-text-secondary">Track</span>
          <span className="text-xs font-extrabold text-text-primary">Accuracy Trends</span>
        </div>
        <div className="p-3 bg-bg-secondary rounded-xl border border-border flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase text-text-secondary">Detect</span>
          <span className="text-xs font-extrabold text-text-primary">Weak Topics</span>
        </div>
        <div className="p-3 bg-bg-secondary rounded-xl border border-border flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase text-text-secondary">Conquer</span>
          <span className="text-xs font-extrabold text-text-primary">Journey Stages</span>
        </div>
      </div>

      {/* ── CTA Action ── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/study"
          className="px-6 py-3 bg-primary hover:bg-yellow-400 border-2.5 border-border rounded-xl text-sm font-black text-text-primary shadow-[0_3px_0_#141827] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Start Your First Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
