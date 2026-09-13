// features/multiplayer/hooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
