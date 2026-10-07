// features/analytics/components/StrengthsAndWeaknesses.tsx

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import type { TopicStrengthWeakness } from "../types";

interface LearningProfileProps {
  strengths: TopicStrengthWeakness[];
  weaknesses: TopicStrengthWeakness[];
}

export function LearningProfileCard({
  strengths,
  weaknesses,
}: LearningProfileProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── 1. NEEDS ATTENTION SUBSECTION (Prioritized for immediate action) ── */}
      <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-2 border-b-2 border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-muted border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1px_0_#141827]">
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                NEEDS ATTENTION
              </h3>
              <p className="text-xs text-text-secondary">
                Topics that could use more practice
              </p>
            </div>
          </div>
        </div>

        {weaknesses.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {weaknesses.map((item) => (
              <div
                key={item.topicId}
                className="p-3 bg-amber-50/30 border-2 border-border rounded-xl flex items-center justify-between gap-3 shadow-[0_1px_0_#141827]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-black text-text-primary truncate">
                      {item.topicName}
                    </h4>
                    <span className="text-[10px] font-bold text-text-secondary">
                      {item.subjectName} • {Math.round(item.averageScore)}% accuracy ({item.quizzesTaken} quiz{item.quizzesTaken > 1 ? "zes" : ""})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0">
                  <Link
                    href={`/study/quiz?subjectId=${item.subjectId}&topicId=${item.topicId}`}
                    aria-label={`Practice ${item.topicName}`}
                    className="px-3 py-1.5 bg-primary hover:bg-yellow-400 border border-border rounded-lg text-xs font-black text-text-primary shadow-[0_1.5px_0_#141827] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-bold text-text-secondary flex flex-col items-center justify-center gap-1.5 bg-bg-secondary/40 rounded-xl border border-dashed border-border/30 p-4">
            <span className="text-emerald-700 font-black">All assessed topics in good standing!</span>
            <span>Keep building skills across new syllabus topics.</span>
          </div>
        )}
      </div>

      {/* ── 2. STRONGEST SUBSECTION ── */}
      <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-2 border-b-2 border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/40 border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1px_0_#141827]">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
                STRONGEST
              </h3>
              <p className="text-xs text-text-secondary">
                Consistent understanding and high accuracy
              </p>
            </div>
          </div>
        </div>

        {strengths.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {strengths.map((item) => (
              <div
                key={item.topicId}
                className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex items-center justify-between gap-3 shadow-[0_1px_0_#141827]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-black text-text-primary truncate">
                      {item.topicName}
                    </h4>
                    <span className="text-[10px] font-bold text-text-secondary">
                      {item.subjectName} • {item.quizzesTaken} quiz{item.quizzesTaken > 1 ? "zes" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm font-black text-emerald-700">
                    {Math.round(item.averageScore)}%
                  </span>
                  <Link
                    href={`/study/quiz?subjectId=${item.subjectId}&topicId=${item.topicId}`}
                    aria-label={`Review ${item.topicName}`}
                    className="px-2.5 py-1 bg-surface hover:bg-emerald-50 border border-border rounded-lg text-[10px] font-extrabold text-text-primary shadow-[0_1px_0_#141827] flex items-center gap-1 transition-all"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-bold text-text-secondary flex flex-col items-center justify-center gap-1.5 bg-bg-secondary/40 rounded-xl border border-dashed border-border/30 p-4">
            <span className="text-text-primary font-black">Building your strengths profile</span>
            <span>Keep practicing quizzes to reveal your strongest topics.</span>
          </div>
        )}
      </div>
    </div>
  );
}


