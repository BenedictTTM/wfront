"use client";
// features/multiplayer/components/MatchmakingLobby.tsx

import React, { useEffect, useState } from "react";
import { Subject } from "@/features/curriculum/types";
import { useCurrentUser } from "@/features/auth/hooks";
import { MatchmakingArena } from "./MatchmakingArena";

interface MatchmakingLobbyProps {
  subject: Subject;
  waitingSince?: string;
  onCancel: () => void;
  isCancelling?: boolean;
  matchedOpponent?: {
    gamerTag: string;
    avatarUrl: string;
    elo: number;
    schoolCode: string;
  } | null;
  onReadyToStart?: () => void;
}

function useServerElapsed(waitingSince?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!waitingSince) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [waitingSince]);

  if (!waitingSince) return 0;
  const start = new Date(waitingSince).getTime();
  if (isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function MatchmakingLobby({
  subject,
  waitingSince,
  onCancel,
  isCancelling = false,
  matchedOpponent = null,
  onReadyToStart = () => {},
}: MatchmakingLobbyProps) {
  const elapsed = useServerElapsed(waitingSince);
  const user = useCurrentUser();

  // Construct currentUser profile without PII
  const gamerTag =
    user?.name && !user.name.includes("@")
      ? user.name
      : user?.id
      ? `Scholar_${user.id.slice(0, 4)}`
      : "Scholar";

  return (
    <div className="w-full flex flex-col items-center">
      {/* Subject Badge Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
        <span>{subject.name}</span>
        <span className="opacity-60">•</span>
        <span className="text-[11px] font-bold opacity-80">Ranked Duel</span>
      </div>

      {/* Dynamic Radar Arena with VS Clash Transition (Redundant format card eliminated) */}
      <MatchmakingArena
        currentUser={{
          gamerTag,
          avatarUrl: "",
          elo: 1000,
          schoolCode: "TEMASHS",
        }}
        matchedOpponent={matchedOpponent}
        elapsedSeconds={elapsed}
        onReadyToStart={onReadyToStart}
        onCancel={onCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
