"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronRight, Clock, Swords, Users } from "lucide-react";
import { useSubjects } from "@/features/curriculum/hooks";
import { useJoinQueue, useLeaveQueue, useQueueStatus } from "@/features/multiplayer/hooks";
import { MatchmakingLobby } from "@/features/multiplayer/components/MatchmakingLobby";
import { Subject } from "@/features/curriculum/types";

export default function MultiplayerEntryPage() {
  const router = useRouter();
  const { data: subjects, isLoading, isError } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const joinQueue = useJoinQueue();
  const leaveQueue = useLeaveQueue();

  // Poll queue status every 2s while searching.
  // When the server stamps matchId into the entry, we detect it here and navigate.
  // No WebSocket needed in the lobby — this keeps idle connections to zero.
  const { data: queueStatus } = useQueueStatus(isSearching);

  useEffect(() => {
    if (queueStatus?.matchId && isSearching) {
      // Match found via REST poll → navigate to the live game page.
      // The WS connection is opened only after navigating to /study/multiplayer/[matchId].
      router.push(`/study/multiplayer/${queueStatus.matchId}`);
    }
  }, [queueStatus?.matchId, isSearching, router]);

  const handleStartSearch = async () => {
    if (!selectedSubject) return;
    setIsSearching(true);
    try {
      const result = await joinQueue.mutateAsync({ subjectId: selectedSubject.id });
      // If matchId is already stamped (instant match), navigate immediately
      if (result?.matchId) {
        router.push(`/study/multiplayer/${result.matchId}`);
      }
    } catch {
      setIsSearching(false);
    }
  };

  const handleCancel = async () => {
    setIsSearching(false);
    try {
      await leaveQueue.mutateAsync();
    } catch {
      // best-effort cancel
    }
  };

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

  if (isSearching && selectedSubject) {
    return (
      <MatchmakingLobby subject={selectedSubject} onCancel={handleCancel} />
    );
  }

  return (
    <div className="flex flex-col gap-8 py-2 max-w-lg mx-auto w-full">
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

      {/* CTA */}
      <button
        type="button"
        onClick={handleStartSearch}
        disabled={!selectedSubject || joinQueue.isPending}
        className="w-full py-4 bg-secondary text-text-primary border-[2px] border-border rounded-2xl text-sm font-black shadow-[0_4px_0_rgba(20,24,39,0.9)] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Swords size={16} />
        {joinQueue.isPending ? "ENTERING QUEUE…" : "FIND OPPONENT"}
        <ChevronRight size={15} className="stroke-[3]" />
      </button>

      {/* Rules */}
      <div className="p-4 bg-surface-muted border-[2px] border-border rounded-2xl flex flex-col gap-2 text-xs">
        <span className="font-black uppercase tracking-widest text-text-secondary">Match rules</span>
        <ul className="flex flex-col gap-1 text-text-secondary font-medium">
          <li>⚡ Answer fast for a speed bonus (up to +50 pts)</li>
          <li>🔥 Build streaks for +15 pts per correct answer in a row</li>
          <li>🏆 Highest score after all questions wins</li>
        </ul>
      </div>
    </div>
  );
}
