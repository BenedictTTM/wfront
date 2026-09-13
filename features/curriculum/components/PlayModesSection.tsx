"use client";

import React from "react";
import Link from "next/link";
import { Zap, Swords, ChevronRight, Users, Clock } from "lucide-react";

export function PlayModesSection() {
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
          href="/study/quiz"
          className="p-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all flex flex-col justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)] shrink-0 group-hover:scale-105 transition-transform">
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

            <span className="px-2 py-0.5 bg-primary/20 border border-border text-[10px] font-black rounded-md text-text-primary uppercase tracking-wide">
              Instant
            </span>
          </div>

          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            Jump into 5–10 random questions across any topic to test your recall without altering your linear journey checkpoints.
          </p>

          <div className="pt-2 border-t-[2px] border-border/20 flex items-center justify-between text-xs font-black text-text-primary">
            <span className="flex items-center gap-1 text-text-secondary text-[11px]">
              <Clock size={13} /> 3 min session
            </span>
            <span className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
              START PRACTICE <ChevronRight size={14} className="stroke-[3]" />
            </span>
          </div>
        </Link>

        {/* Multiplayer Arena Card — navigates directly */}
        <Link
          href="/study/multiplayer"
          className="p-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(20,24,39,0.9)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all flex flex-col justify-between gap-4 cursor-pointer text-left group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-secondary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)] shrink-0 group-hover:scale-105 transition-transform">
                <Swords size={22} className="text-text-primary" />
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

            <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black rounded-md text-emerald-400 uppercase tracking-wide">
              Live
            </span>
          </div>

          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            Go head-to-head with fellow candidates in real-time speed rounds. Speed, accuracy, and streaks decide the winner.
          </p>

          <div className="pt-2 border-t-[2px] border-border/20 flex items-center justify-between text-xs font-black text-text-primary">
            <span className="flex items-center gap-1 text-text-secondary text-[11px]">
              <Users size={13} /> Live Matchmaking
            </span>
            <span className="flex items-center gap-1 text-text-primary group-hover:translate-x-0.5 transition-transform">
              ENTER ARENA <ChevronRight size={14} className="stroke-[3]" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
