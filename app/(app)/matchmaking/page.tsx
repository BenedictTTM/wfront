"use client";
// app/(app)/matchmaking/page.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks";
import { useSubjects } from "@/features/curriculum/hooks";
import { useMatchmaking } from "@/features/multiplayer/hooks";
import { MatchmakingArena } from "@/features/multiplayer/components/MatchmakingArena";
import { Swords } from "lucide-react";

export default function MatchmakingPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: subjects } = useSubjects();

  const {
    selectedSubject,
    setSelectedSubject,
    isSearching,
    queueStatus,
    cancelSearch,
    isLeaving,
  } = useMatchmaking();

  const [matchedOpponent, setMatchedOpponent] = useState<{
    gamerTag: string;
    avatarUrl: string;
    elo: number;
    schoolCode: string;
  } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Auto-select first subject if not set
  useEffect(() => {
    if (!selectedSubject && subjects && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject, setSelectedSubject]);

  // Elapsed timer tracking
  useEffect(() => {
    if (!isSearching && !queueStatus?.inQueue) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSearching, queueStatus?.inQueue]);

  // When matchId arrives from backend, trigger the RIVAL_FOUND state
  useEffect(() => {
    if (queueStatus?.matchId && !matchedOpponent) {
      setMatchedOpponent({
        gamerTag: "ApexRival",
        avatarUrl: "",
        elo: 1180,
        schoolCode: "REGIONAL",
      });
    }
  }, [queueStatus?.matchId, matchedOpponent]);

  // Ready to start callback triggered after exactly 800ms clash animation
  const handleReadyToStart = () => {
    if (queueStatus?.matchId) {
      router.push(`/study/multiplayer/${queueStatus.matchId}`);
    }
  };

  const gamerTag =
    user?.name && !user.name.includes("@")
      ? user.name
      : user?.id
      ? `Scholar_${user.id.slice(0, 4)}`
      : "Scholar";

  return (
    <main className="w-full min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Subject indicator */}
      {selectedSubject && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-400 border border-slate-900 flex items-center justify-center text-slate-950 font-black shadow-sm">
            <Swords size={16} />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-slate-100">
            {selectedSubject.name} Arena
          </span>
        </div>
      )}

      {/* Main Matchmaking Arena */}
      <MatchmakingArena
        currentUser={{
          gamerTag,
          avatarUrl: "",
          elo: 1050,
          schoolCode: "TEMASHS",
        }}
        matchedOpponent={matchedOpponent}
        elapsedSeconds={elapsedSeconds}
        onReadyToStart={handleReadyToStart}
        onCancel={cancelSearch}
        isCancelling={isLeaving}
      />
    </main>
  );
}
