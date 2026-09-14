// features/curriculum/journey-hooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJourneyProgress,
  getLearningJourney,
  getNextChallenge,
  getSubjectJourney,
  recordLevelCompletion,
  startJourneyNodeSession,
} from "./journey-api";

export function useSubjectJourney(subjectSlug: string) {
  return useQuery({
    queryKey: ["journey", subjectSlug],
    queryFn: () => getSubjectJourney(subjectSlug),
    enabled: !!subjectSlug,
    staleTime: 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.code === "UNAUTHORIZED") return false;
      return failureCount < 2;
    },
  });
}

export function useStartJourneyNodeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => startJourneyNodeSession(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}

// ── Structured Learning Journey Progression Hooks ────────────────────────────

export function useLearningJourney(subjectSlug: string) {
  return useQuery({
    queryKey: ["learning-journey", subjectSlug],
    queryFn: () => getLearningJourney(subjectSlug),
    enabled: !!subjectSlug,
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.code === "UNAUTHORIZED") return false;
      return failureCount < 2;
    },
  });
}

export function useJourneyProgress(journeyId: string | undefined) {
  return useQuery({
    queryKey: ["journey-progress", journeyId],
    queryFn: () => (journeyId ? getJourneyProgress(journeyId) : Promise.reject("No journeyId")),
    enabled: !!journeyId,
    staleTime: 30 * 1000,
  });
}

export function useNextChallenge(levelId: string | null) {
  return useQuery({
    queryKey: ["journey-challenge", levelId],
    queryFn: () => (levelId ? getNextChallenge(levelId) : Promise.reject("No levelId")),
    enabled: !!levelId,
    staleTime: 0, // always fresh challenge
  });
}

export function useRecordLevelCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      levelId,
      data,
    }: {
      levelId: string;
      data: { score: number; idempotencyKey: string; attemptId?: string };
    }) => recordLevelCompletion(levelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-journey"] });
      queryClient.invalidateQueries({ queryKey: ["journey-progress"] });
      queryClient.invalidateQueries({ queryKey: ["journey"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
