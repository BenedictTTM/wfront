"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subject } from "@/features/curriculum/types";
import {
  fetchMultiplayerToken,
  getMatchResult,
  getQueueStatus,
  joinMatchmakingQueue,
  leaveMatchmakingQueue,
} from "./api";
import { JoinQueuePayload } from "./types";

export function useQueueStatus(enabled = true, isSearching = false) {
  return useQuery({
    queryKey: ["multiplayer", "queue-status"],
    queryFn: getQueueStatus,
    enabled,
    refetchInterval: (query) => (query.state.data?.inQueue || isSearching ? 2000 : false),
    staleTime: 0,
  });
}

export function useJoinQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinQueuePayload) => joinMatchmakingQueue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multiplayer", "queue-status"] });
    },
  });
}

export function useLeaveQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveMatchmakingQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multiplayer", "queue-status"] });
    },
  });
}

export function useMatchResult(matchId: string | null) {
  return useQuery({
    queryKey: ["multiplayer", "match", matchId],
    queryFn: () => getMatchResult(matchId!),
    enabled: !!matchId,
    staleTime: Infinity, // completed matches don't change
  });
}

/**
 * Hook to retrieve and decode the authenticated WebSocket token for multiplayer.
 */
export function useMultiplayerToken() {
  return useQuery({
    queryKey: ["multiplayer", "token"],
    queryFn: async () => {
      const jwtToken = await fetchMultiplayerToken();
      let currentUserId: string | null = null;
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split(".")[1]));
          currentUserId = payload.sub ?? payload.id ?? null;
        } catch {
          // ignore decode error
        }
      }
      return { token: jwtToken, currentUserId };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook encapsulating multiplayer matchmaking queue polling, joining, leaving,
 * and automatic transition to the match screen when matched.
 */
export function useMatchmaking(excludeMatchId?: string) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isJoiningLocal, setIsJoiningLocal] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const joinQueue = useJoinQueue();
  const leaveQueue = useLeaveQueue();

  // Enabled on mount to detect existing active queue entries after page refresh.
  const { data: queueStatus } = useQueueStatus(true, isJoiningLocal);

  const isInCurrentMatch = Boolean(excludeMatchId && queueStatus?.matchId === excludeMatchId);
  const isSearching = Boolean(
    (!isInCurrentMatch && queueStatus?.inQueue) || isJoiningLocal || joinQueue.isPending
  );

  // Navigate as soon as matchId is populated by backend matchmaking (excluding previous match)
  useEffect(() => {
    if (queueStatus?.matchId && queueStatus.matchId !== excludeMatchId) {
      router.push(`/study/multiplayer/${queueStatus.matchId}`);
    }
  }, [queueStatus?.matchId, router, excludeMatchId]);

  const startSearch = async (subject?: Subject | null) => {
    const targetSubject = subject ?? selectedSubject;
    if (!targetSubject) return;
    setJoinError(null);
    setIsJoiningLocal(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mp_last_subject_id", targetSubject.id);
        sessionStorage.setItem("mp_last_subject_name", targetSubject.name);
      }
      const result = await joinQueue.mutateAsync({ subjectId: targetSubject.id });
      if (result?.matchId && result.matchId !== excludeMatchId) {
        router.push(`/study/multiplayer/${result.matchId}`);
      }
    } catch (err: unknown) {
      const httpError = err as { status?: number; message?: string };
      const message =
        httpError?.status === 400
          ? "A matchmaking request is already in progress. Please wait a moment."
          : httpError?.status === 404
          ? "Guests cannot enter the multiplayer arena. Please log in first."
          : "Unable to join the matchmaking queue. Please check your connection and try again.";
      setJoinError(message);
    } finally {
      setIsJoiningLocal(false);
    }
  };

  const cancelSearch = async () => {
    setIsJoiningLocal(false);
    setJoinError(null);
    try {
      await leaveQueue.mutateAsync();
    } catch {
      // best-effort cancel
    }
  };

  return {
    selectedSubject,
    setSelectedSubject,
    isSearching,
    queueStatus,
    joinError,
    startSearch,
    cancelSearch,
    isJoining: joinQueue.isPending || isJoiningLocal,
    isLeaving: leaveQueue.isPending,
  };
}

export { useStreak } from "./hooks/use-streak";

