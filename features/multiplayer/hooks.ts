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

export function useQueueStatus(enabled = true) {
  return useQuery({
    queryKey: ["multiplayer", "queue-status"],
    queryFn: getQueueStatus,
    enabled,
    refetchInterval: 2000, // poll every 2s — fast enough for match detection without hammering the server
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
export function useMatchmaking() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const joinQueue = useJoinQueue();
  const leaveQueue = useLeaveQueue();

  // Poll queue status every 2s while searching.
  const { data: queueStatus } = useQueueStatus(isSearching);

  useEffect(() => {
    if (queueStatus?.matchId && isSearching) {
      router.push(`/study/multiplayer/${queueStatus.matchId}`);
    }
  }, [queueStatus?.matchId, isSearching, router]);

  const startSearch = async (subject?: Subject | null) => {
    const targetSubject = subject ?? selectedSubject;
    if (!targetSubject) return;
    setIsSearching(true);
    try {
      const result = await joinQueue.mutateAsync({ subjectId: targetSubject.id });
      if (result?.matchId) {
        router.push(`/study/multiplayer/${result.matchId}`);
      }
    } catch {
      setIsSearching(false);
    }
  };

  const cancelSearch = async () => {
    setIsSearching(false);
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
    startSearch,
    cancelSearch,
    isJoining: joinQueue.isPending,
    isLeaving: leaveQueue.isPending,
  };
}
