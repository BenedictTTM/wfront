"use client";
// features/multiplayer/components/MatchResults.tsx

import React from "react";
import Link from "next/link";
import { Trophy, Swords, ArrowRight, RotateCcw, Crown, Medal } from "lucide-react";
import { MatchEndData, ParticipantState } from "../types";

interface MatchResultsProps {
  matchEnd: MatchEndData;
  participants: ParticipantState[];
  currentUserId: string;
  subjectId?: string | null;
  onPlayAgain: () => void;
}

const RANK_CONFIG = [
  { icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", label: "Winner" },
  { icon: Medal, color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/30", label: "2nd Place" },
];

export function MatchResults({
  matchEnd,
  participants,
  currentUserId,
  onPlayAgain,
}: MatchResultsProps) {
  const myRanking = matchEnd.rankings.find((r) => r.participantId === currentUserId);
  const isWinner = myRanking?.isWinner ?? false;

  return (
    <div className="flex flex-col items-center gap-7 py-4">
      {/* Win/Loss banner */}
      <div
        className={`w-full p-5 rounded-2xl border-[3px] text-center flex flex-col items-center gap-2 shadow-[0_6px_0_rgba(20,24,39,0.9)] ${
          isWinner
            ? "bg-amber-500/10 border-amber-400/40"
            : "bg-surface border-border"
        }`}
      >
        {isWinner ? (
          <>
            <Trophy size={40} className="text-amber-400" />
            <h2 className="text-2xl font-black text-text-primary">Victory!</h2>
            <p className="text-sm text-text-secondary font-medium">
              You dominated the arena. Outstanding!
            </p>
          </>
        ) : (
          <>
            <Swords size={40} className="text-text-secondary" />
            <h2 className="text-2xl font-black text-text-primary">Defeated</h2>
            <p className="text-sm text-text-secondary font-medium">
              Keep grinding — your next match is your comeback!
            </p>
          </>
        )}
      </div>

      {/* Final podium */}
      <div className="w-full flex flex-col gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Final Standings
        </span>

        {matchEnd.rankings.map((ranking, idx) => {
          const config = RANK_CONFIG[idx] ?? RANK_CONFIG[1];
          const Icon = config.icon;
          const isSelf = ranking.participantId === currentUserId;
          const participant = participants.find((p) => p.id === ranking.participantId);

          return (
            <div
              key={ranking.participantId}
              className={`flex items-center gap-4 p-4 rounded-2xl border-[2px] shadow-[0_3px_0_rgba(20,24,39,0.9)] ${
                isSelf ? `${config.bg}` : "bg-surface border-border"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-surface border-[2px] border-border flex items-center justify-center shrink-0">
                <Icon size={20} className={config.color} />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-xs font-black text-text-primary">
                  {isSelf ? "You" : ranking.name ?? participant?.name ?? "Opponent"}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">
                  {config.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-text-primary tabular-nums">
                  {ranking.score.toLocaleString()}
                </span>
                <span className="block text-[10px] font-bold text-text-secondary">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-text-primary border-[2px] border-border rounded-xl text-sm font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <RotateCcw size={15} />
          PLAY AGAIN
        </button>
        <Link
          href="/study"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface text-text-primary border-[2px] border-border rounded-xl text-sm font-black shadow-[0_3px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all"
        >
          BACK TO STUDY
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
