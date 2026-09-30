"use client";

import React from "react";
import Link from "next/link";
import { Zap, Swords, ChevronRight, Users, Clock } from "lucide-react";

interface PlayModesSectionProps {
  activeSubjectId?: string;
}

export function PlayModesSection({ activeSubjectId }: PlayModesSectionProps) {
  return (
    <section aria-labelledby="play-modes-heading" className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3
          id="play-modes-heading"
          className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5"
        >
          <span>Play &amp; Practice</span>
        </h3>
        <span className="text-[11px] font-bold text-text-secondary">
          Fast-Paced Modes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Practice Card */}
        <Link
          href={activeSubjectId ? `/study/quiz?subjectId=${activeSubjectId}&mode=quiz` : "/study"}
          className="p-5 bg-surface border-[3px] border-border rounded-2xl shadow-[0_5px_0_rgba(20,24,39,0.9)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all flex flex-col justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary border-[2.5px] border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0 group-hover:scale-105 transition-transform">
                <Zap size={22} className="fill-text-primary text-text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block">
                  Solo Mode
                </span>
                <h4 className="font-black text-text-primary text-base">
                  Quick Practice
                </h4>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-primary/30 border-[1.5px] border-border text-[10px] font-black rounded-lg text-text-primary uppercase tracking-wide shadow-[0_1px_0_#141827]">
              Instant
            </span>
          </div>

          <p className="text-xs text-text-secondary font-bold leading-relaxed">
            Jump into 5–10 random questions across any topic to test your recall without altering your linear journey checkpoints.
          </p>

          <div className="pt-3 border-t-[2px] border-border/20 flex items-center justify-between text-xs font-black text-text-primary">
            <span className="flex items-center gap-1.5 text-text-secondary text-[11px] font-bold">
              <Clock size={13} className="text-text-primary stroke-[2.5]" /> 3 min session
            </span>
            <span className="px-3 py-1.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black shadow-[0_2px_0_#141827] group-hover:shadow-[0_3px_0_#141827] transition-all flex items-center gap-1">
              <span>PRACTICE</span>
              <ChevronRight size={14} className="stroke-[3]" />
            </span>
          </div>
        </Link>

        {/* Multiplayer Arena Card */}
        <Link
          href="/study/multiplayer"
          className="p-5 bg-surface border-[3px] border-border rounded-2xl shadow-[0_5px_0_rgba(20,24,39,0.9)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all flex flex-col justify-between gap-4 cursor-pointer text-left group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-secondary border-[2.5px] border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0 group-hover:scale-105 transition-transform">
                <Swords size={22} className="text-text-primary stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block">
                  Live Arena
                </span>
                <h4 className="font-black text-text-primary text-base">
                  Multiplayer Battle
                </h4>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-400/20 border-[1.5px] border-border text-[10px] font-black rounded-lg text-emerald-800 uppercase tracking-wide shadow-[0_1px_0_#141827]">
              Live
            </span>
          </div>

          <p className="text-xs text-text-secondary font-bold leading-relaxed">
            Go head-to-head with fellow candidates in real-time speed rounds. Speed, accuracy, and streaks decide the winner.
          </p>

          <div className="pt-3 border-t-[2px] border-border/20 flex items-center justify-between text-xs font-black text-text-primary">
            <span className="flex items-center gap-1.5 text-text-secondary text-[11px] font-bold">
              <Users size={13} className="text-text-primary stroke-[2.5]" /> Live Matchmaking
            </span>
            <span className="px-3 py-1.5 bg-secondary text-text-primary border-[2px] border-border rounded-xl font-black shadow-[0_2px_0_#141827] group-hover:shadow-[0_3px_0_#141827] transition-all flex items-center gap-1">
              <span>ENTER ARENA</span>
              <ChevronRight size={14} className="stroke-[3]" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
