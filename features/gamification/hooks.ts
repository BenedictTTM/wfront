// features/gamification/hooks.ts — TanStack Query hooks for gamification data

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAchievements,
  getChallenges,
  getDashboard,
  getEnergy,
  getLeaderboard,
  getStreak,
  refillEnergy,
} from "./api";

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
    queryKey: ["gamification", "challenges"],
    queryFn: getChallenges,
    staleTime: 60 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["gamification", "achievements"],
    queryFn: getAchievements,
    staleTime: 60 * 1000,
  });
}

export function useLeaderboard(params?: {
  scope?: "global" | "subject";
  subjectId?: string;
  week?: string;
}) {
  return useQuery({
    queryKey: ["gamification", "leaderboard", params],
    queryFn: () => getLeaderboard(params),
    staleTime: 60 * 1000,
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
