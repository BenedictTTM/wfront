"use client";
// features/multiplayer/use-multiplayer-ws.ts
//
// Best practices implemented:
// - Connection opened ONLY on the live game page (never in matchmaking lobby)
// - Exponential backoff reconnect (1s → 2s → 4s → 8s, max 30s)
// - Outbound message queue: buffers messages sent while reconnecting, flushes on reconnect
// - Auth timeout handled by server (10s); client handles auth immediately on open
// - Cleanup: all timers cleared on unmount; close without triggering reconnect

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMultiplayerWsUrl } from "./api";
import {
  DisconnectGraceState,
  MatchEndData,
  MatchState,
  MultiplayerFlashcard,
  ParticipantState,
  RoundRevealData,
  WsErrorEvent,
  WsMatchAbandonedEvent,
  WsMatchCountdownEvent,
  WsMatchEndEvent,
  WsPlayerDisconnectedEvent,
  WsPlayerReconnectedEvent,
  WsQuestionStartEvent,
  WsRoomStateEvent,
  WsRoundRevealEvent,
} from "./types";

export type { MatchEndData, RoundRevealData, MultiplayerFlashcard, DisconnectGraceState };

export type MultiplayerWsStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "authenticated"
  | "reconnecting"
  | "error"
  | "closed";

const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];

export type UseMultiplayerWsOptions = {
  /** JWT access token for WS auth. Hook does NOT connect if null. */
  token: string | null;
  /** Match ID to join once authenticated. */
  matchId: string | null;
  /** Authenticated user ID for matching disconnect grace. */
  currentUserId?: string | null;
};

export type UseMultiplayerWsReturn = {
  status: MultiplayerWsStatus;
  matchState: MatchState | null;
  participants: ParticipantState[];
  countdown: number | null;
  flashcards: MultiplayerFlashcard[];
  currentQuestion: WsQuestionStartEvent | null;
  selectedOptionId: string | null;
  roundReveal: RoundRevealData | null;
  matchEnd: MatchEndData | null;
  disconnectGrace: DisconnectGraceState | null;
  abandonData: WsMatchAbandonedEvent | null;
  submitAnswer: (questionId: string, optionId: string, timeTakenMs: number) => void;
  reconnect: () => void;
};

export function useMultiplayerWs({
  token,
  matchId,
  currentUserId,
}: UseMultiplayerWsOptions): UseMultiplayerWsReturn {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});
  const matchStateRef = useRef<MatchState | null>(null);
  const currentUserIdRef = useRef<string | null>(currentUserId ?? null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId ?? null;
  }, [currentUserId]);

  /** Outbound message queue — flushed once connection is authenticated. */
  const messageQueueRef = useRef<Array<{ event: string; data: unknown }>>([]);

  const [status, setStatus] = useState<MultiplayerWsStatus>("idle");
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<MultiplayerFlashcard[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<WsQuestionStartEvent | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [roundReveal, setRoundReveal] = useState<RoundRevealData | null>(null);
  const [matchEnd, setMatchEnd] = useState<MatchEndData | null>(null);
  const [disconnectGrace, setDisconnectGrace] = useState<DisconnectGraceState | null>(null);
  const [abandonData, setAbandonData] = useState<WsMatchAbandonedEvent | null>(null);

  /** Low-level send — queues if not yet authenticated. */
  const sendRaw = useCallback((event: string, data: unknown = {}) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    } else {
      // Buffer — will be flushed once authenticated
      messageQueueRef.current.push({ event, data });
    }
  }, []);

  /** Flush queued messages to the now-open connection. */
  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const queue = messageQueueRef.current.splice(0);
    for (const msg of queue) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    mountedRef.current = true;
    if (!token) return;

    // Clean up any existing connection without triggering reconnect
    const existing = wsRef.current;
    if (existing) {
      existing.onclose = null;
      existing.close();
      wsRef.current = null;
    }

    const attempt = reconnectAttemptRef.current;
    const isReconnect = attempt > 0;
    setStatus(isReconnect ? "reconnecting" : "connecting");

    const url = getMultiplayerWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("connected");
      // Authenticate immediately — server will close in 10s if we don't
      ws.send(JSON.stringify({ event: "authenticate", data: { token } }));
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      let parsed: { event: string; data: unknown };
      try {
        parsed = JSON.parse(event.data as string);
      } catch {
        return;
      }

      const { event: evtName, data } = parsed;

      switch (evtName) {
        case "authenticated": {
          reconnectAttemptRef.current = 0; // reset backoff on success
          setStatus("authenticated");
          flushQueue();
          // If self had a disconnect grace running, clear it now that connection is restored
          setDisconnectGrace((prev) => {
            if (
              prev &&
              (!currentUserIdRef.current ||
                prev.disconnectedUserId === currentUserIdRef.current ||
                prev.disconnectedUserId === "me")
            ) {
              return null;
            }
            return prev;
          });
          // Join room immediately after auth
          if (matchId) {
            ws.send(JSON.stringify({ event: "join_room", data: { matchId } }));
          }
          break;
        }

        case "room_state": {
          const d = data as WsRoomStateEvent;
          matchStateRef.current = d.state;
          setMatchState(d.state);
          setParticipants(d.participants);
          break;
        }

        case "match_countdown": {
          const d = data as WsMatchCountdownEvent;
          setMatchState("STARTING");
          if (d.flashcards && d.flashcards.length > 0) {
            setFlashcards(d.flashcards);
          }
          queryClient.invalidateQueries({ queryKey: ["gamification"] });
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          let remaining = d.seconds;
          setCountdown(remaining);
          countdownTimerRef.current = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
              }
              setCountdown(null);
            } else {
              setCountdown(remaining);
            }
          }, 1000);
          break;
        }

        case "question_start": {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdown(null);
          const d = data as WsQuestionStartEvent;
          setCurrentQuestion(d);
          setSelectedOptionId(null);
          setRoundReveal(null);
          setMatchState("QUESTION_ACTIVE");
          break;
        }

        case "round_reveal": {
          const d = data as WsRoundRevealEvent;
          setRoundReveal({ correctOptionId: d.correctOptionId, results: d.results, explanation: d.explanation });
          setMatchState("ROUND_REVEAL");
          setParticipants((prev) =>
            prev.map((p) => {
              const res = d.results.find((r) => r.participantId === p.id);
              return res ? { ...p, score: res.newScore } : p;
            })
          );
          break;
        }

        case "player_disconnected": {
          const d = data as WsPlayerDisconnectedEvent;
          const expiresAt = d.expiresAt || Date.now() + (d.graceSeconds || 30) * 1000;
          const initialRemaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
          setDisconnectGrace({
            disconnectedUserId: d.disconnectedUserId,
            remainingSeconds: initialRemaining,
            expiresAt,
          });
          break;
        }

        case "player_reconnected": {
          setDisconnectGrace(null);
          break;
        }

        case "match_end": {
          const d = data as WsMatchEndEvent;
          setDisconnectGrace(null);
          setMatchEnd({ matchId: d.matchId, rankings: d.rankings });
          setMatchState("FINISHED");
          queryClient.invalidateQueries({ queryKey: ["gamification"] });
          setParticipants((prev) =>
            prev.map((p) => {
              const ranking = d.rankings.find((r) => r.participantId === p.id);
              return ranking
                ? { ...p, score: ranking.score, rank: ranking.rank, isWinner: ranking.isWinner }
                : p;
            })
          );
          break;
        }

        case "match_abandoned": {
          const d = data as WsMatchAbandonedEvent;
          setDisconnectGrace(null);
          setAbandonData(d);
          setMatchState("ABANDONED");
          break;
        }

        case "error": {
          const d = data as WsErrorEvent;
          console.error(`[MultiplayerWS] ${d.code}: ${d.message}`);
          break;
        }
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("error");
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("closed");

      // Don't reconnect if the match is in a terminal state
      const terminalStates: Array<MatchState | null> = ["FINISHED", "ABANDONED", null];
      const currentMatchState = matchStateRef.current;

      // After a finished match, close is expected — no reconnect needed
      if (terminalStates.includes(currentMatchState)) return;

      // Match is in progress and connection severed — initiate local forfeit countdown
      setDisconnectGrace((prev) => {
        if (prev) return prev;
        const expiresAt = Date.now() + 30_000;
        return {
          disconnectedUserId: currentUserIdRef.current || "me",
          remainingSeconds: 30,
          expiresAt,
        };
      });

      // Exponential backoff reconnect
      const attempt = reconnectAttemptRef.current;
      const delayMs = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
      reconnectAttemptRef.current = attempt + 1;

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connectRef.current();
      }, delayMs);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, matchId, flushQueue]);

  useEffect(() => {
    matchStateRef.current = matchState;
  }, [matchState]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const submitAnswer = useCallback(
    (questionId: string, optionId: string, timeTakenMs: number) => {
      if (!matchId || selectedOptionId) return; // idempotent
      setSelectedOptionId(optionId);
      sendRaw("submit_answer", {
        matchId,
        questionId,
        selectedOptionId: optionId,
        timeTakenMs,
      });
    },
    [matchId, selectedOptionId, sendRaw]
  );

  const handleReconnect = useCallback(() => {
    mountedRef.current = true;
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  // Connect when token is available (i.e. when we're on the live game page)
  useEffect(() => {
    mountedRef.current = true;
    if (token) {
      connect();
    }
    return () => {
      mountedRef.current = false;
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional unmount
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Active ticker to count down forfeit grace seconds in real time
  useEffect(() => {
    if (!disconnectGrace) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((disconnectGrace.expiresAt - now) / 1000));
      setDisconnectGrace((prev) => (prev ? { ...prev, remainingSeconds: diff } : null));
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [disconnectGrace?.expiresAt]);

  // Network offline / online detection for immediate forfeit timer feedback
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      const terminalStates: Array<MatchState | null> = ["FINISHED", "ABANDONED", null];
      if (!terminalStates.includes(matchStateRef.current)) {
        setDisconnectGrace((prev) => {
          if (prev) return prev;
          const expiresAt = Date.now() + 30_000;
          return {
            disconnectedUserId: currentUserIdRef.current || "me",
            remainingSeconds: 30,
            expiresAt,
          };
        });
      }
    };

    const handleOnline = () => {
      if (mountedRef.current && token && matchId) {
        connectRef.current();
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [token, matchId]);

  return {
    status,
    matchState,
    participants,
    countdown,
    flashcards,
    currentQuestion,
    selectedOptionId,
    roundReveal,
    matchEnd,
    disconnectGrace,
    abandonData,
    submitAnswer,
    reconnect: handleReconnect,
  };
}
