"use client";

// features/mock-exam/components/SessionTerminatedScreen.tsx
// Screen shown when the LockIn™ session ends due to focus violation.
// Does NOT offer a retry or resume — the student must start fresh.

import React from "react";
import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";

interface SessionTerminatedScreenProps {
  reason?: string;
}

export function SessionTerminatedScreen({ reason }: SessionTerminatedScreenProps) {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center gap-8 py-12 px-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Icon */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-[#141827] border-2 border-[#141827] flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.6)]">
          <ShieldOff size={36} className="text-white/70" strokeWidth={1.5} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#141827]/30" />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-black text-[#141827] tracking-tight">
          Simulation Ended
        </h1>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-black uppercase tracking-widest text-[#5C6470]">
            Reason
          </p>
          <p className="text-sm font-semibold text-[#141827]">
            {reason || "Focus commitment broken."}
          </p>
        </div>

        <div className="mt-2 p-4 bg-[#F5F1E8] border-2 border-[#141827]/10 rounded-xl">
          <p className="text-sm text-[#5C6470] leading-relaxed">
            Your simulation has ended because you left the examination environment.
            <br />
            <span className="font-bold text-[#141827]">Progress has not been recorded.</span>
          </p>
        </div>
      </div>

      {/* No XP, no rewards notice */}
      <div className="flex items-center gap-6 text-xs text-[#5C6470]">
        <span className="flex items-center gap-1.5">
          <span className="text-[10px] line-through opacity-60">+XP</span>
          <span className="opacity-60">No XP awarded</span>
        </span>
        <span className="w-px h-4 bg-[#141827]/20" />
        <span className="flex items-center gap-1.5">
          <span className="opacity-60">No completion credit</span>
        </span>
      </div>

      {/* Action */}
      <Link
        href="/study/mock-exams"
        className="flex items-center gap-2 px-6 py-3 bg-[#141827] text-white border-2 border-[#141827] rounded-xl font-black text-sm shadow-[0_4px_0_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.4)] transition-all"
      >
        <ArrowLeft size={16} />
        Return to Mock Exams
      </Link>

      <p className="text-xs text-[#5C6470]/60 max-w-xs leading-relaxed">
        To earn credit, you must complete an exam without leaving the examination environment.
        Start a fresh simulation when you are ready.
      </p>
    </div>
  );
}
