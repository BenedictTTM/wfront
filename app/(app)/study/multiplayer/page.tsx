"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, ChevronRight, Swords, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSubjects } from "@/features/curriculum/hooks";
import { useMatchmaking } from "@/features/multiplayer/hooks";
import { useEnergy } from "@/features/gamification/hooks";
import { EnergyWarningModal } from "@/features/quiz/components/EnergyWarningModal";
import { MatchmakingLobby } from "@/features/multiplayer/components/MatchmakingLobby";
import { VersusMatchTransition } from "@/features/multiplayer/components/VersusMatchTransition";
import { useCurrentUser } from "@/features/auth/hooks";
import { safeStorage } from "@/lib/storage";
import { type CustomProfileState } from "@/features/auth/constants";

export default function MultiplayerEntryPage() {
  const queryClient = useQueryClient();
  const [isPreviewingVersus, setIsPreviewingVersus] = useState(false);
  const [showEnergyWarning, setShowEnergyWarning] = useState(false);
  const { data: energyData } = useEnergy();
  const userEnergy = energyData?.current ?? 30;
  const authUser = useCurrentUser();
  const { data: subjects, isLoading, isError } = useSubjects();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  }, [queryClient]);
  const {
    selectedSubject,
    setSelectedSubject,
    isSearching,
    queueStatus,
    joinError,
    startSearch,
    cancelSearch,
    isJoining,
    isLeaving,
  } = useMatchmaking();

  React.useEffect(() => {
    if (joinError && joinError.toLowerCase().includes("energy")) {
      setShowEnergyWarning(true);
    }
  }, [joinError]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-10 max-w-lg mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface border-[2px] border-border rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !subjects?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle size={32} className="text-destructive" />
        <p className="text-sm font-bold text-text-secondary">
          Unable to load subjects. Please try again.
        </p>
      </div>
    );
  }

  // If user refreshed while in queue, find the subject from queueStatus.subjectId
  const activeSubject =
    selectedSubject ||
    (queueStatus?.subjectId && subjects
      ? subjects.find((s) => s.id === queueStatus.subjectId) ?? null
      : null);

  if ((isSearching || queueStatus?.inQueue) && activeSubject) {
    return (
      <MatchmakingLobby
        subject={activeSubject}
        waitingSince={queueStatus?.waitingSince}
        onCancel={cancelSearch}
        isCancelling={isLeaving}
      />
    );
  }

  const activeUserId = authUser?.id || "guest";
  const storageKey = `wassce_student_profile_${activeUserId}`;
  const savedProfile = safeStorage.getItem<CustomProfileState | null>(storageKey, null);

  const studentDisplayName =
    savedProfile?.name?.trim() ||
    authUser?.name?.trim() ||
    (authUser?.email ? authUser.email.split("@")[0] : null) ||
    "Student";

  const studentSchoolName =
    savedProfile?.school?.trim() ||
    authUser?.school?.name ||
    "Independent Scholar";

  const studentSchoolShortCode =
    savedProfile?.schoolShortCode ||
    authUser?.school?.shortCode ||
    (studentSchoolName !== "Independent Scholar"
      ? studentSchoolName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase()
      : "IND");

  const studentCrestUrl =
    savedProfile?.schoolCrestUrl ||
    authUser?.school?.crestUrl ||
    (studentSchoolName?.toLowerCase().includes("aquinas") ||
    studentSchoolShortCode === "AQUINAS" ||
    studentSchoolShortCode === "AQU"
      ? "https://res.cloudinary.com/dsriwu6yn/image/upload/v1791470415/crests/st-thomas-aquinas-senior-high-school.jpg"
      : null);

  const studentAvatarUrl =
    savedProfile?.avatarUrl ||
    authUser?.avatarUrl ||
    null;

  const studentRegion =
    savedProfile?.schoolRegion ||
    authUser?.school?.region ||
    null;

  const studentMotto =
    authUser?.school?.motto ||
    null;

  if (isPreviewingVersus) {
    const previewPlayer1 = {
      username: studentDisplayName,
      avatarUrl: studentAvatarUrl,
      elo: 1000,
      schoolName: studentSchoolName,
      schoolShortCode: studentSchoolShortCode,
      schoolColor: "#055B38",
      schoolAccentColor: "#F4D06F",
      crestUrl: studentCrestUrl,
      motto: studentMotto,
      region: studentRegion,
    };

    const previewPlayer2 = {
      username: "Opponent Scholar",
      avatarUrl: null,
      elo: 1000,
      schoolName: "WASSCE Scholar League",
      schoolShortCode: "WSL",
      schoolColor: "#172554",
      schoolAccentColor: "#93C5FD",
      crestUrl: null,
      motto: null,
      region: null,
    };

    return (
      <div className="flex flex-col items-center gap-4 py-4 max-w-4xl mx-auto w-full">
        <VersusMatchTransition
          player1={previewPlayer1}
          player2={previewPlayer2}
          subject={selectedSubject ? `${selectedSubject.name.toUpperCase()} • SPEED ROUND` : "CORE MATHEMATICS • SPEED ROUND"}
          stakes="+25 SCHOOL TURF PTS"
          onComplete={() => setIsPreviewingVersus(false)}
        />
        <button
          type="button"
          onClick={() => setIsPreviewingVersus(false)}
          className="px-4 py-2 bg-surface hover:bg-surface-muted text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] cursor-pointer"
        >
          Exit Preview
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-2 max-w-lg mx-auto w-full">
      {/* Error banner if join failed */}
      {joinError && (
        <div className="p-4 bg-rose-500/10 border-[2px] border-rose-500/40 rounded-2xl flex items-center gap-3 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-[0_2px_0_rgba(20,24,39,0.9)]">
          <AlertCircle size={18} className="shrink-0 text-rose-500" />
          <span>{joinError}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <Swords size={20} className="text-text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">Multiplayer Arena</h1>
            <p className="text-xs text-text-secondary font-medium">
              1v1 speed rounds — pick a subject to enter the queue
            </p>
          </div>
        </div>
      </header>

      {/* Subject selector */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Choose subject
        </span>
        <div className="flex flex-col gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setSelectedSubject(subject)}
              className={`flex items-center justify-between p-4 rounded-2xl border-[2px] text-left transition-all cursor-pointer ${
                selectedSubject?.id === subject.id
                  ? "bg-primary/10 border-primary/50 shadow-[0_3px_0_rgba(20,24,39,0.9)]"
                  : "bg-surface border-border hover:-translate-y-0.5 shadow-[0_2px_0_rgba(20,24,39,0.9)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl border-[2px] border-border flex items-center justify-center text-sm font-black ${
                    selectedSubject?.id === subject.id ? "bg-primary" : "bg-surface-muted"
                  }`}
                >
                  {subject.name.charAt(0)}
                </div>
                <div>
                  <span className="font-black text-text-primary text-sm">{subject.name}</span>
                  <span className="block text-[11px] text-text-secondary font-medium">
                    {subject.name.toLowerCase().includes("math") ? "30 questions" : "10 questions"} · 15s each
                  </span>
                </div>
              </div>
              {selectedSubject?.id === subject.id && (
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-border" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CTA: Find Opponent */}
      <button
        type="button"
        onClick={() => {
          if (userEnergy < 3) {
            setShowEnergyWarning(true);
            return;
          }
          startSearch();
        }}
        disabled={!selectedSubject || isJoining}
        className="w-full py-4 bg-secondary text-text-primary border-[2px] border-border rounded-2xl text-sm font-black shadow-[0_4px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Swords size={16} />
        {isJoining ? "ENTERING QUEUE…" : "FIND OPPONENT (3 🔋)"}
        <ChevronRight size={15} className="stroke-[3]" />
      </button>

      {/* Cinematic Preview Button */}
      <button
        type="button"
        onClick={() => setIsPreviewingVersus(true)}
        className="w-full py-3 bg-surface hover:bg-surface-muted text-text-primary border-[2px] border-border rounded-2xl text-xs font-black shadow-[0_3px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Zap size={14} className="text-amber-500 fill-amber-400" />
        <span>PREVIEW 1v1 VERSUS TRANSITION</span>
      </button>

      {/* Rules */}
      <div className="p-4 bg-surface-muted border-[2px] border-border rounded-2xl flex flex-col gap-2 text-xs">
        <span className="font-black uppercase tracking-widest text-text-secondary">Match rules</span>
        <ul className="flex flex-col gap-1 text-text-secondary font-medium">
          <li>🔋 Match Entry: 3 Energy per session</li>
          <li>⚡ Answer fast for a speed bonus (up to +50 pts)</li>
          <li>🔥 Build streaks for +15 pts per correct answer in a row</li>
          <li>🏆 Highest score after all questions wins (+50 XP for win, +20 XP participate)</li>
        </ul>
      </div>

      <EnergyWarningModal
        isOpen={showEnergyWarning}
        onClose={() => setShowEnergyWarning(false)}
        currentEnergy={userEnergy}
      />
    </div>
  );
}
