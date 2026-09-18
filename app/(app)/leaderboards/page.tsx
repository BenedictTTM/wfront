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
  School,
} from "lucide-react";
import { useStats } from "@/components/providers/stats-provider";
import { useLeaderboard } from "@/features/gamification/hooks";
import { useSubjects } from "@/features/curriculum/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { safeStorage } from "@/lib/storage";
import type { CustomProfileState } from "@/features/auth/constants";
import { EmptyState, ErrorState, PageHeader } from "@/components/shared";

export default function LeaderboardsPage() {
  const { xp } = useStats();
  const currentUser = useCurrentUser();
  const userProfile = currentUser?.id
    ? safeStorage.getItem<CustomProfileState | null>(
        `wassce_student_profile_${currentUser.id}`,
        null
      )
    : null;

  // Tab & Filter States
  const [scope, setScope] = useState<"global" | "subject">("global");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Subjects for subject-scoped leaderboard
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();

  const activeSubjectId = selectedSubjectId || (subjects && subjects.length > 0 ? subjects[0].id : "");

  // Fetch live backend leaderboard data
  const {
    data: leaderboard,
    isLoading: loadingLeaderboard,
    isError,
    refetch,
  } = useLeaderboard({
    scope,
    subjectId: scope === "subject" ? activeSubjectId : undefined,
  });

  const userScore = leaderboard?.currentUserEntry?.score ?? 0;
  const currentTotalXp = Math.max(xp, userScore);
  const isUnlocked = currentTotalXp >= 30;

  return (
    <div className="flex flex-col gap-8 py-2 w-full max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <PageHeader
        title="Weekly Leaderboards"
        description="Compete weekly with fellow WASSCE scholars across West Africa."
        icon={<Trophy className="w-6 h-6 text-text-primary" />}
        actions={
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
      }
    />

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

      {/* ── 1. Initial Loading Skeleton (while fetching and no leaderboard exists yet) ── */}
      {loadingLeaderboard && !leaderboard ? (
        <div className="flex flex-col gap-6 animate-pulse">
          {/* Standing Card Skeleton */}
          <div className="h-24 bg-surface border-2.5 border-border rounded-2xl shadow-offset" />
          {/* Standings Table Skeleton */}
          <div className="border-2.5 border-border bg-surface rounded-2xl shadow-offset p-6 flex flex-col gap-4">
            <div className="h-6 w-44 bg-surface-muted rounded-lg" />
            <div className="h-14 bg-surface-muted rounded-xl" />
            <div className="h-14 bg-surface-muted rounded-xl" />
            <div className="h-14 bg-surface-muted rounded-xl" />
          </div>
        </div>
      ) : !isUnlocked ? (
        /* ── 2. Truly Locked State (<30 XP) ── */
        <div className="p-8 border-3 border-dashed border-border rounded-2xl text-center bg-surface flex flex-col items-center gap-4 shadow-offset animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center text-text-secondary">
            <Lock size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-xl font-black text-text-primary">Leaderboard Locked</h3>
            <p className="text-xs md:text-sm font-extrabold text-text-secondary leading-relaxed">
              Earn at least <span className="text-text-primary font-black">30 XP</span> to unlock weekly rankings. Currently you have <span className="text-[#FF9E2C] font-black">{currentTotalXp} XP</span>.
            </p>
          </div>
          <div className="w-full max-w-xs bg-surface-muted border-2 border-border rounded-full h-3.5 overflow-hidden mt-1">
            <div
              className="h-full bg-primary border-r-2 border-border transition-all duration-300"
              style={{ width: `${Math.min(100, (currentTotalXp / 30) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">
            Progress: {currentTotalXp} / 30 XP
          </span>
        </div>
      ) : (
        /* ── 3. Live Leaderboard View ── */
        <div className="flex flex-col gap-6">
          {/* Current User Standings Card */}
          {leaderboard?.currentUserEntry && (() => {
            const userSchool = userProfile?.school || leaderboard.currentUserEntry.school;
            const myAvatar = userProfile?.avatarUrl || leaderboard.currentUserEntry.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser?.name || leaderboard.currentUserEntry.name)}&backgroundColor=f6d86b`;
            const myInitial = ((currentUser?.name || leaderboard.currentUserEntry.name)?.[0] || "U").toUpperCase();

            return (
              <div className="bg-primary/20 border-2.5 border-border p-4 rounded-2xl shadow-offset flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center text-text-primary font-black text-sm shadow-[0_2px_0_#141827] shrink-0">
                    #{leaderboard.currentUserEntry.rank}
                  </div>

                  {/* User Avatar Circle */}
                  <div className="w-10 h-10 rounded-full bg-primary border-2 border-border flex items-center justify-center font-black text-sm text-text-primary shrink-0 shadow-sm overflow-hidden select-none relative">
                    <span className="absolute inset-0 flex items-center justify-center font-black text-sm text-text-primary">
                      {myInitial}
                    </span>
                    {myAvatar && (
                      <img
                        src={myAvatar}
                        alt="Your Avatar"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-text-secondary uppercase tracking-wider block">Your Standing</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base font-black text-text-primary">
                        {currentUser?.name || leaderboard.currentUserEntry.name}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-primary border border-border rounded-full uppercase shrink-0">
                        YOU
                      </span>
                    </div>
                    {userSchool && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary mt-0.5">
                        <School size={13} className="shrink-0 text-text-secondary/80" />
                        <span className="truncate">{userSchool}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-black text-base text-[#FF9E2C] shrink-0">
                  <Zap size={18} className="fill-[#FF9E2C]" />
                  <span>{leaderboard.currentUserEntry.score} XP</span>
                </div>
              </div>
            );
          })()}

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
              <ErrorState
                title="Failed to load leaderboard rankings"
                message="Please try again to view weekly standings."
                onRetry={() => refetch()}
                retryText="Try Again"
              />
            ) : !leaderboard?.entries || leaderboard.entries.length === 0 ? (
              <EmptyState
                icon={<Trophy size={32} className="text-text-secondary opacity-40" />}
                title="No Rankings Registered This Week Yet!"
                description="Complete quizzes to earn XP and take the #1 spot!"
              />
            ) : (
              <div className="divide-y-2 divide-border/20">
                {leaderboard.entries.map((entry, idx) => {
                  const isCurrent = currentUser?.id === entry.userId || entry.rank === leaderboard.currentUserEntry?.rank;
                  const rank = entry.rank || idx + 1;
                  const school = isCurrent
                    ? (userProfile?.school || entry.school)
                    : entry.school;
                  const avatarSrc = isCurrent
                    ? (userProfile?.avatarUrl || entry.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=f6d86b`)
                    : (entry.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=f6d86b`);
                  const initial = (entry.name?.[0] || "S").toUpperCase();

                  // Podium styling
                  let rankBadge = null;
                  const bgHighlight = isCurrent ? "bg-primary/20" : "hover:bg-bg-primary/50";

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

                        {/* User Avatar Circle with Image */}
                        <div className="w-9 h-9 rounded-full bg-primary border-2 border-border flex items-center justify-center font-black text-xs text-text-primary shrink-0 shadow-sm overflow-hidden select-none relative">
                          <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-text-primary">
                            {initial}
                          </span>
                          {avatarSrc && (
                            <img
                              src={avatarSrc}
                              alt={entry.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>

                        {/* User Name & School */}
                        <div className="flex flex-col min-w-0">
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
                          {school && (
                            <div className="flex items-center gap-1 text-xs font-bold text-text-secondary truncate mt-0.5">
                              <School size={12} className="shrink-0 text-text-secondary/70" />
                              <span className="truncate">{school}</span>
                            </div>
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

