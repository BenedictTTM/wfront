"use client";

import React, { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { useMultiplayerWs } from "@/features/multiplayer/use-multiplayer-ws";
import { ParticipantRail } from "@/features/multiplayer/components/ParticipantRail";
import { LiveQuestion } from "@/features/multiplayer/components/LiveQuestion";
import { RoundReveal } from "@/features/multiplayer/components/RoundReveal";
import { MatchResults } from "@/features/multiplayer/components/MatchResults";


export default function LiveMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [subjectId] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/token")
      .then((res) => (res.ok ? res.json() : { token: null }))
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          try {
            const payload = JSON.parse(atob(data.token.split(".")[1]));
            setCurrentUserId(payload.sub ?? payload.id ?? null);
          } catch {
            // ignore decode error
          }
        }
      })
      .catch((err) => console.error("Failed to load WS token", err));
  }, []);

  const {
    status,
    matchState,
    participants,
    countdown,
    currentQuestion,
    selectedOptionId,
    roundReveal,
    matchEnd,
    submitAnswer,
    reconnect,
  } = useMultiplayerWs({ token, matchId });

  const handlePlayAgain = useCallback(() => {
    router.push("/study/multiplayer");
  }, [router]);

  const handleSubmitAnswer = useCallback(
    (questionId: string, optionId: string, timeTakenMs: number) => {
      submitAnswer(questionId, optionId, timeTakenMs);
    },
    [submitAnswer]
  );

  // Connection status badge
  const isConnected = status === "authenticated" || status === "connected";
  const isError = status === "error" || status === "closed";

  return (
    <div className="flex flex-col gap-5 py-2 max-w-lg mx-auto w-full min-h-[70vh]">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Live Match
        </span>
        <div className="flex items-center gap-1.5">
          {isError ? (
            <>
              <WifiOff size={12} className="text-rose-400" />
              <button
                type="button"
                onClick={reconnect}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                RECONNECT
              </button>
            </>
          ) : isConnected ? (
            <>
              <Wifi size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400">LIVE</span>
            </>
          ) : (
            <Loader2 size={12} className="text-text-secondary animate-spin" />
          )}
        </div>
      </div>

      {/* Participant rail (always visible during match) */}
      {participants.length > 0 && currentQuestion && (
        <ParticipantRail
          participants={participants}
          currentUserId={currentUserId ?? ""}
          totalQuestions={currentQuestion.totalQuestions}
          currentQuestionIndex={currentQuestion.questionIndex}
        />
      )}

      {/* ── State machine views ── */}

      {/* Connecting / Lobby */}
      {(!matchState || matchState === "LOBBY" || matchState === "STARTING") && !matchEnd && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          {countdown !== null ? (
            <>
              <span className="text-6xl font-black text-primary animate-ping-slow tabular-nums">
                {countdown}
              </span>
              <span className="text-sm font-black text-text-secondary uppercase tracking-widest">
                Get ready!
              </span>
            </>
          ) : (
            <>
              <Loader2 size={32} className="text-text-secondary animate-spin" />
              <span className="text-sm font-black text-text-secondary">
                {status === "connecting" ? "Connecting…" : "Waiting for opponent…"}
              </span>
            </>
          )}
        </div>
      )}

      {/* Active question */}
      {matchState === "QUESTION_ACTIVE" && currentQuestion && (
        <LiveQuestion
          questionData={currentQuestion}
          selectedOptionId={selectedOptionId}
          onSelect={handleSubmitAnswer}
        />
      )}

      {/* Round reveal */}
      {matchState === "ROUND_REVEAL" && roundReveal && currentQuestion && (
        <RoundReveal
          revealData={roundReveal}
          currentQuestion={currentQuestion.question}
          participants={participants}
          currentUserId={currentUserId ?? ""}
          selectedOptionId={selectedOptionId}
        />
      )}

      {/* Match end */}
      {matchState === "FINISHED" && matchEnd && (
        <MatchResults
          matchEnd={matchEnd}
          participants={participants}
          currentUserId={currentUserId ?? ""}
          subjectId={subjectId}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
