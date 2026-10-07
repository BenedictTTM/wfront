// features/analytics/components/MultiplayerCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  Swords,
  ArrowRight,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { MultiplayerStats } from "../types";

interface MultiplayerCardProps {
  stats?: MultiplayerStats | null;
  isLoading?: boolean;
}

export function MultiplayerCard({ stats, isLoading = false }: MultiplayerCardProps) {
  // ── 1. LOADING STATE ──
  if (isLoading) {
    return <MultiplayerSkeleton />;
  }

  const matchesPlayed = stats?.matchesPlayed ?? 0;
  const wins = stats?.wins ?? stats?.matchesWon ?? 0;
  const losses = stats?.losses ?? Math.max(0, matchesPlayed - wins);
  const winRate = stats?.winRate;
  const currentRank = stats?.currentRank;
  const recentRankMovement = stats?.recentRankMovement;

  // ── 2. EMPTY STATE ──
  if (!stats || matchesPlayed === 0) {
    return (
      <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1.5px_0_#141827] shrink-0">
            <Swords className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
              Competitive Head-to-Head
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Play your first match to start seeing your competitive stats.
            </p>
          </div>
        </div>

        <Link
          href="/study#play-modes"
          className="px-4 py-2 bg-primary hover:bg-[#ebd060] border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[40px]"
        >
          <span>Play Multiplayer</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </Link>
      </div>
    );
  }

  // Determine rank movement badge styling
  const isRankUp = recentRankMovement && recentRankMovement.startsWith("+");
  const isRankDown = recentRankMovement && recentRankMovement.startsWith("-");

  return (
    <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4">
      {/* ── Card Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-[0_1px_0_#141827]">
            <Swords className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
              Competitive Performance
            </h3>
            <p className="text-[11px] font-bold text-text-secondary">
              Head-to-head battles and arena standings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leaderboards"
            className="text-xs font-black text-text-secondary hover:text-text-primary inline-flex items-center gap-1 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboards</span>
          </Link>
          <Link
            href="/study#play-modes"
            className="px-3 py-1 bg-primary hover:bg-primary-hover border border-border rounded-lg text-[11px] font-black text-text-primary shadow-[0_1px_0_#141827] flex items-center gap-1 transition-all"
          >
            <span>Play Multiplayer</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Stats Metric Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Matches Played */}
        <div className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_0_#141827]">
          <span className="text-[10px] font-black uppercase text-text-secondary tracking-wider">
            Matches
          </span>
          <span className="text-lg font-black text-text-primary mt-0.5">
            {matchesPlayed}
          </span>
        </div>

        {/* Wins */}
        <div className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_0_#141827]">
          <span className="text-[10px] font-black uppercase text-text-secondary tracking-wider">
            Wins
          </span>
          <span className="text-lg font-black text-emerald-700 mt-0.5">
            {wins}
          </span>
        </div>

        {/* Losses */}
        <div className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_0_#141827]">
          <span className="text-[10px] font-black uppercase text-text-secondary tracking-wider">
            Losses
          </span>
          <span className="text-lg font-black text-text-secondary mt-0.5">
            {losses}
          </span>
        </div>

        {/* Win Rate */}
        <div className="p-3 bg-bg-secondary border-2 border-border rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_0_#141827]">
          <span className="text-[10px] font-black uppercase text-text-secondary tracking-wider">
            Win Rate
          </span>
          <span className="text-lg font-black text-purple-700 mt-0.5">
            {winRate !== null ? `${winRate}%` : "—"}
          </span>
        </div>
      </div>

      {/* ── Rank & Recent Movement (Where Available) ── */}
      {currentRank !== undefined && currentRank !== null && (
        <div className="p-3 bg-bg-secondary/70 border-2 border-border rounded-xl flex items-center justify-between gap-3 shadow-[0_1px_0_#141827]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-text-secondary">
              Current Weekly Rank:
            </span>
            <span className="text-xs font-black text-text-primary">
              #{currentRank}
            </span>
          </div>

          {recentRankMovement && (
            <div className="flex items-center gap-1 text-[11px] font-black">
              <span className="text-text-secondary">Movement:</span>
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] ${
                  isRankUp
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : isRankDown
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : "bg-surface text-text-secondary border-border"
                }`}
              >
                {isRankUp && <TrendingUp className="w-3 h-3" />}
                {isRankDown && <TrendingDown className="w-3 h-3" />}
                {!isRankUp && !isRankDown && <Minus className="w-3 h-3" />}
                <span>{recentRankMovement}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MultiplayerSkeleton() {
  return (
    <div className="p-5 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border" />
          <div className="flex flex-col gap-1.5">
            <div className="w-32 h-3 bg-bg-secondary rounded" />
            <div className="w-44 h-2.5 bg-bg-secondary rounded" />
          </div>
        </div>
        <div className="w-24 h-6 bg-bg-secondary rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-bg-secondary border-2 border-border rounded-xl" />
        ))}
      </div>
    </div>
  );
}


