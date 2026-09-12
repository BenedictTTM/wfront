// features/gamification/hooks.ts — TanStack Query hooks for gamification data

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimQuestReward,
  getChallenges,
  getDashboard,
  getEnergy,
  getLeaderboard,
  getQuestCatalog,
  getStreak,
  getUserQuests,
  refillEnergy,
  convertDiamondsToEnergy,
} from "./api";

export function useQuests() {
  return useQuery({
    queryKey: ["quests", "user"],
    queryFn: getUserQuests,
    staleTime: 30 * 1000,
  });
}

export function useQuestCatalog() {
  return useQuery({
    queryKey: ["quests", "catalog"],
    queryFn: getQuestCatalog,
    staleTime: 60 * 1000,
  });
}

export function useClaimQuestReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodId: string) => claimQuestReward(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["gamification", "dashboard"],
    queryFn: getDashboard,
    staleTime: 30 * 1000,
  });
}

export function useEnergy() {
  return useQuery({
    queryKey: ["gamification", "energy"],
    queryFn: getEnergy,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // periodic refetch to sync timer
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ["gamification", "streak"],
    queryFn: getStreak,
    staleTime: 60 * 1000,
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ["quests", "user"],
    queryFn: getUserQuests,
    staleTime: 30 * 1000,
  });
}

export function useLeaderboard(params?: {
  scope?: "global" | "subject";
  subjectId?: string;
  week?: string;
}) {
  // Don't fetch when scope=subject but no subjectId has been selected yet
  // (avoids a 400/404 during the subject-tab render before the useEffect fires)
  const isReady =
    params?.scope !== "subject" || Boolean(params?.subjectId);

  return useQuery({
    queryKey: ["gamification", "leaderboard", params],
    queryFn: () => getLeaderboard(params),
    staleTime: 60 * 1000,
    enabled: isReady,
    // Retry up to 3 times with exponential backoff to handle intermittent
    // Neon WebSocket / cold-start failures on the backend
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useRefillEnergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refillEnergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useConvertDiamondsToEnergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (diamonds?: number) => convertDiamondsToEnergy(diamonds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}
