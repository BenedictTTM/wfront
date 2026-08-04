"use client";

import React, { useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Lock,
  Globe,
  BookOpen,
  Zap,
  Loader2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useStats } from "@/components/providers/stats-provider";
import { useLeaderboard } from "@/features/gamification/hooks";
import { useSubjects } from "@/features/curriculum/hooks";
import { useCurrentUser } from "@/features/auth/hooks";

export default function LeaderboardsPage() {
  const { xp } = useStats();
  const currentUser = useCurrentUser();

  // Tab & Filter States
  const [scope, setScope] = useState<"global" | "subject">("global");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Subjects for subject-scoped leaderboard
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();

  // Set default subject when switching to subject scope
  React.useEffect(() => {
    if (scope === "subject" && subjects && subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [scope, subjects, selectedSubjectId]);

  // Fetch live backend leaderboard data
  const {
    data: leaderboard,
    isLoading: loadingLeaderboard,
    isError,
    refetch,
  } = useLeaderboard({
    scope,
    subjectId: scope === "subject" ? selectedSubjectId : undefined,
  });

  const isUnlocked = xp >= 30;

  return (
    <div className="flex flex-col gap-8 py-2 w-full max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2.5 border-border pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary border-2.5 border-border flex items-center justify-center shadow-[0_3px_0_#141827]">
            <Trophy className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
              Weekly Leaderboards
            </h1>
            <p className="text-xs md:text-sm font-extrabold text-text-secondary">
              Compete weekly with fellow WASSCE scholars across West Africa.
            </p>
          </div>
        </div>

        {/* Scope Tabs: Global vs Subject */}
        <div className="flex items-center bg-bg-secondary p-1 border-2.5 border-border rounded-2xl shadow-sm self-start md:self-auto">
          <button
            type="button"
            onClick={() => setScope("global")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              scope === "global"
                ? "bg-primary text-text-primary border-2 border-border shadow-[0_2px_0_#141827]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Globe size={14} />
            <span>GLOBAL</span>
          </button>
          <button
            type="button"
            onClick={() => setScope("subject")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              scope === "subject"
                ? "bg-primary text-text-primary border-2 border-border shadow-[0_2px_0_#141827]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <BookOpen size={14} />
            <span>BY SUBJECT</span>
          </button>
        </div>
      </div>

      {/* ── Subject Filter Bar (When Scope is Subject) ── */}
      {scope === "subject" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border-2.5 border-border p-4 rounded-2xl shadow-offset animate-in fade-in duration-200">
          <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
            Select Subject:
          </span>
          {loadingSubjects ? (
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading subjects...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {(subjects || []).map((subj) => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`px-3 py-1.5 border-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary border-border text-text-primary shadow-[0_2px_0_#141827]"
                        : "bg-bg-primary border-border text-text-secondary hover:bg-surface-muted"
                    }`}
                  >
                    {subj.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Locked State Banner (<30 XP) ── */}
      {!isUnlocked ? (
        <div className="p-8 border-3 border-dashed border-border rounded-2xl text-center bg-surface flex flex-col items-center gap-4 shadow-offset animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center text-text-secondary">
            <Lock size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-xl font-black text-text-primary">Leaderboard Locked</h3>
            <p className="text-xs md:text-sm font-extrabold text-text-secondary leading-relaxed">
              Earn at least <span className="text-text-primary font-black">30 XP</span> to unlock weekly rankings. Currently you have <span className="text-[#FF9E2C] font-black">{xp} XP</span>.
            </p>
          </div>
          <div className="w-full max-w-xs bg-surface-muted border-2 border-border rounded-full h-3.5 overflow-hidden mt-1">
            <div
              className="h-full bg-primary border-r-2 border-border transition-all duration-300"
              style={{ width: `${Math.min(100, (xp / 30) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">
            Progress: {xp} / 30 XP
          </span>
        </div>
      ) : (
        /* ── Live Leaderboard View ── */
        <div className="flex flex-col gap-6">
          {/* Current User Standings Card */}
          {leaderboard?.currentUserEntry && (
            <div className="bg-primary/20 border-2.5 border-border p-4 rounded-2xl shadow-offset flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center text-text-primary font-black text-sm shadow-[0_2px_0_#141827]">
                  #{leaderboard.currentUserEntry.rank}
                </div>
                <div>
                  <span className="text-xs font-black text-text-secondary uppercase tracking-wider block">Your Standing</span>
                  <span className="text-base font-black text-text-primary flex items-center gap-1.5">
                    <span>{currentUser?.name || leaderboard.currentUserEntry.name}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-primary border border-border rounded-full uppercase">YOU</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-black text-base text-[#FF9E2C]">
                <Zap size={18} className="fill-[#FF9E2C]" />
                <span>{leaderboard.currentUserEntry.score} XP</span>
              </div>
            </div>
          )}

          {/* Leaderboard Table Container */}
          <div className="border-2.5 border-border bg-surface rounded-2xl shadow-offset overflow-hidden animate-in fade-in duration-300">
            <div className="bg-[#FFFDF6] border-b-2.5 border-border p-4 flex items-center justify-between">
              <span className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-[#FF9E2C]" />
                <span>Top Weekly Standings</span>
              </span>
              <span className="text-[10px] font-extrabold text-text-secondary uppercase bg-surface border border-border px-2.5 py-1 rounded-lg">
                Resets Sunday 23:59 UTC
              </span>
            </div>

            {loadingLeaderboard ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-secondary">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-black">Fetching live rankings...</span>
              </div>
            ) : isError ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-red-500">Failed to load leaderboard rankings.</span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-primary border-2 border-border rounded-xl font-extrabold text-xs shadow-sm cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : !leaderboard?.entries || leaderboard.entries.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <Trophy size={32} className="text-text-secondary opacity-40" />
                <span className="text-sm font-black text-text-primary">No Rankings Registered This Week Yet!</span>
                <span className="text-xs text-text-secondary font-extrabold">Complete quizzes to earn XP and take the #1 spot!</span>
              </div>
            ) : (
              <div className="divide-y-2 divide-border/20">
                {leaderboard.entries.map((entry, idx) => {
                  const isCurrent = currentUser?.id === entry.userId || entry.rank === leaderboard.currentUserEntry?.rank;
                  const rank = entry.rank || idx + 1;

                  // Podium styling
                  let rankBadge = null;
                  let bgHighlight = isCurrent ? "bg-primary/20" : "hover:bg-bg-primary/50";

                  if (rank === 1) {
                    rankBadge = <Crown size={18} className="text-amber-500 fill-amber-400" />;
                  } else if (rank === 2) {
                    rankBadge = <Medal size={18} className="text-slate-400 fill-slate-300" />;
                  } else if (rank === 3) {
                    rankBadge = <Medal size={18} className="text-amber-700 fill-amber-600" />;
                  }

                  return (
                    <div
                      key={entry.userId || idx}
                      className={`flex items-center justify-between p-4 transition-colors ${bgHighlight}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-8 h-8 rounded-xl bg-surface border-2 border-border flex items-center justify-center shrink-0 font-black text-xs shadow-sm">
                          {rankBadge || `#${rank}`}
                        </div>

                        {/* User Avatar Initial */}
                        <div className="w-9 h-9 rounded-full bg-primary border-2 border-border flex items-center justify-center font-black text-xs text-text-primary shrink-0 shadow-sm">
                          {(entry.name?.[0] || "S").toUpperCase()}
                        </div>

                        {/* User Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm md:text-base truncate ${isCurrent ? "font-black text-text-primary" : "font-bold text-text-primary"}`}>
                            {entry.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-primary border border-border rounded-full uppercase shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* XP Score */}
                      <div className="flex items-center gap-1.5 text-xs md:text-sm font-black text-[#FF9E2C] shrink-0">
                        <Zap size={16} className="fill-[#FF9E2C]" />
                        <span>{entry.score} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

