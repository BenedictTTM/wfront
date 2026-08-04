"use client";

// features/mock-exam/components/MockExamResultsScreen.tsx
// Results screen shown after successful exam submission.

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Shield,
  Award,
} from "lucide-react";
import { MockExamSubmitResult } from "../types";

interface MockExamResultsScreenProps {
  results: MockExamSubmitResult;
  focusScore?: number;
  onStartNew: () => void;
}

export function MockExamResultsScreen({
  results,
  focusScore,
  onStartNew,
}: MockExamResultsScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const total = results.scoredAnswers?.length || 0;
  const correct = results.scoredAnswers?.filter((a) => a.isCorrect).length || 0;
  const passed = results.score >= 50;

  const getFocusGrade = (score: number) => {
    if (score >= 95) return { label: "Excellent", color: "#22c55e" };
    if (score >= 80) return { label: "Good", color: "#84cc16" };
    if (score >= 60) return { label: "Fair", color: "#f59e0b" };
    return { label: "Needs Work", color: "#ef4444" };
  };

  const focusGrade = focusScore !== undefined ? getFocusGrade(focusScore) : null;

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in zoom-in-95 duration-300 w-full max-w-xl mx-auto">
      {/* ── Trophy ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-[#141827] shadow-[0_6px_0_rgba(0,0,0,0.9)] ${
            passed ? "bg-[#F6D86B]" : "bg-[#F5F1E8]"
          }`}
        >
          <Trophy
            className={`w-10 h-10 ${passed ? "text-[#141827]" : "text-[#5C6470]"}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[#141827]">
            {passed ? "Simulation Complete! 🎉" : "Simulation Complete"}
          </h2>
          <p className="text-sm font-bold text-[#5C6470]">
            You scored{" "}
            <span className="text-[#141827] font-black">{results.score}%</span>{" "}
            ({correct} / {total} correct)
          </p>
        </div>
      </div>

      {/* ── Score cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* XP */}
        <div className="bg-surface border-2 border-[#141827] rounded-xl p-4 flex flex-col gap-2 shadow-[0_3px_0_#141827]">
          <div className="flex items-center gap-1.5 text-[#5C6470]">
            <Zap size={14} fill="#E28743" className="text-[#E28743]" />
            <span className="text-xs font-black uppercase tracking-wider">XP Earned</span>
          </div>
          <span className="text-2xl font-black text-[#141827]">
            +{results.xpAwarded}
          </span>
        </div>

        {/* Focus Score */}
        {focusGrade !== null && focusScore !== undefined ? (
          <div className="bg-surface border-2 border-[#141827] rounded-xl p-4 flex flex-col gap-2 shadow-[0_3px_0_#141827]">
            <div className="flex items-center gap-1.5 text-[#5C6470]">
              <Shield size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Focus Score</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black" style={{ color: focusGrade.color }}>
                {Math.round(focusScore)}
              </span>
              <span className="text-xs font-bold text-[#5C6470]">/ 100</span>
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: focusGrade.color }}
            >
              {focusGrade.label}
            </span>
          </div>
        ) : (
          <div className="bg-surface border-2 border-[#141827] rounded-xl p-4 flex flex-col gap-2 shadow-[0_3px_0_#141827]">
            <div className="flex items-center gap-1.5 text-[#5C6470]">
              <Award size={14} />
              <span className="text-xs font-black uppercase tracking-wider">Grade</span>
            </div>
            <span
              className="text-2xl font-black"
              style={{ color: passed ? "#22c55e" : "#ef4444" }}
            >
              {passed ? "PASS" : "FAIL"}
            </span>
          </div>
        )}
      </div>

      {/* ── Performance bar ───────────────────────────────────────────── */}
      <div className="bg-surface border-2 border-[#141827] rounded-xl p-5 flex flex-col gap-3 shadow-[0_3px_0_#141827]">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#5C6470]">
            Performance
          </span>
          <span className="text-xs font-black text-[#141827]">
            {correct} correct · {total - correct} incorrect
          </span>
        </div>
        <div className="w-full h-3 bg-[#F5F1E8] border-2 border-[#141827] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 rounded-full"
            style={{
              width: `${results.score}%`,
              backgroundColor: passed ? "#22c55e" : "#F6D86B",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#5C6470]">
          <span>0%</span>
          <span className="text-[#141827] font-black">{results.score}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Review answers toggle ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowReview((p) => !p)}
        className="flex items-center justify-between w-full px-4 py-3 border-2 border-[#141827] rounded-xl font-bold text-sm hover:bg-[#F5F1E8] transition-colors cursor-pointer"
      >
        <span>Review Answers</span>
        {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showReview && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.scoredAnswers?.map((a, i) => {
            const snap = a.questionSnapshot as any;
            return (
              <div
                key={a.questionId}
                className={`p-4 rounded-xl border-2 flex flex-col gap-2 ${
                  a.isCorrect
                    ? "border-green-400/40 bg-green-50/30"
                    : "border-rose-400/40 bg-rose-50/30"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {a.isCorrect ? (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-[#5C6470]">
                      Q{i + 1}
                    </p>
                    <p className="text-sm font-medium text-[#141827] leading-snug line-clamp-3">
                      {snap?.text || "Question text unavailable"}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-xs text-[#5C6470]">
                        Your answer:{" "}
                        <span className={`font-bold ${a.isCorrect ? "text-green-600" : "text-rose-600"}`}>
                          {a.selectedOptionId || a.submittedText || "Not answered"}
                        </span>
                      </p>
                      {!a.isCorrect && (
                        <p className="text-xs text-[#5C6470]">
                          Correct answer:{" "}
                          <span className="font-bold text-green-600">{a.correctOption}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onStartNew}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#141827] text-white border-2 border-[#141827] rounded-xl font-black text-sm shadow-[0_4px_0_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.4)] transition-all cursor-pointer"
        >
          <RotateCcw size={15} />
          Start New Simulation
        </button>
        <Link
          href="/study"
          className="text-center text-xs font-bold text-[#5C6470] hover:text-[#141827] transition-colors py-2"
        >
          Back to Study Center
        </Link>
      </div>
    </div>
  );
}
