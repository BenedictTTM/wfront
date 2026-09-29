// features/analytics/components/AnalyticsCalculatingState.tsx

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Calculator,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

interface AnalyticsCalculatingStateProps {
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function AnalyticsCalculatingState({
  onRefresh,
  isFetching = false,
}: AnalyticsCalculatingStateProps) {
  return (
    <div className="p-6 sm:p-10 bg-surface border-2.5 border-border rounded-3xl shadow-[0_6px_0_#141827] flex flex-col items-center text-center max-w-2xl mx-auto my-6 gap-7 animate-in fade-in duration-300">
      {/* ── Visual Mascot / Icon Badge ── */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-[#FFF8E7] border-2.5 border-border flex items-center justify-center text-text-primary shadow-[0_4px_0_#141827]">
          <BrainCircuit className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-100 border-2 border-border flex items-center gap-1.5 shadow-[0_2px_0_#141827]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
            Processing
          </span>
        </div>
      </div>

      {/* ── Headline & Narrative ── */}
      <div className="flex flex-col gap-2 max-w-lg">
        <div className="inline-flex items-center justify-center gap-2 self-center px-3 py-1 bg-primary/30 border border-border rounded-lg text-xs font-black uppercase text-text-primary">
          <Calculator className="w-3.5 h-3.5" />
          <span>Crunching Your Numbers</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
          Calculating Your Performance Analytics...
        </h3>
        <p className="text-xs sm:text-sm font-bold text-text-secondary leading-relaxed">
          We’ve received your quiz answers! We’re currently analyzing your topic accuracy, detecting strengths & weaknesses, and building your personalized WASSCE readiness profile.
        </p>
      </div>

      {/* ── 3-Step Milestone Pipeline ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
        {/* Step 1: Completed */}
        <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl flex flex-col gap-1.5 shadow-[0_2px_0_#141827]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wide">
              Step 1
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-black text-text-primary">Quiz Recorded</span>
          <span className="text-[11px] font-bold text-text-secondary">
            Answers & timing verified
          </span>
        </div>

        {/* Step 2: In-Progress */}
        <div className="p-3.5 bg-[#FFF8E7] border-2 border-border rounded-2xl flex flex-col gap-1.5 shadow-[0_2px_0_#141827] ring-2 ring-primary/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wide">
              Step 2
            </span>
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          </div>
          <span className="text-xs font-black text-text-primary">Topic Mastery</span>
          <span className="text-[11px] font-bold text-text-secondary">
            Evaluating syllabus areas
          </span>
        </div>

        {/* Step 3: Pending */}
        <div className="p-3.5 bg-bg-secondary/70 border-2 border-border rounded-2xl flex flex-col gap-1.5 shadow-[0_2px_0_#141827] opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-text-secondary tracking-wide">
              Step 3
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-text-secondary" />
          </div>
          <span className="text-xs font-black text-text-primary">Exam Forecast</span>
          <span className="text-[11px] font-bold text-text-secondary">
            Synthesizing readiness score
          </span>
        </div>
      </div>

      {/* ── Auto-refresh notice banner ── */}
      <div className="w-full p-3 bg-bg-secondary/60 border border-border rounded-xl text-center">
        <p className="text-xs font-bold text-text-secondary">
          ✨ <span className="font-extrabold text-text-primary">Auto-updating:</span> This page will automatically transition to your dashboard the moment calculations finalize.
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-yellow-400 border-2.5 border-border rounded-xl font-black text-xs sm:text-sm text-text-primary shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>{isFetching ? "Checking Status..." : "Refresh Status"}</span>
        </button>

        <Link
          href="/study"
          className="w-full sm:w-auto px-5 py-2.5 bg-surface hover:bg-surface-muted border-2.5 border-border rounded-xl font-black text-xs sm:text-sm text-text-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-center"
        >
          <BookOpen className="w-4 h-4" />
          <span>Practice Next Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
