import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLearningJourney,
  getSubjectJourney,
  startJourneyNodeSession,
} from "./journey-api";

export function useSubjectJourney(subjectSlug: string) {
  return useQuery({
    queryKey: ["journey", subjectSlug],
    queryFn: () => getSubjectJourney(subjectSlug),
    enabled: !!subjectSlug,
    staleTime: 60 * 1000,
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
  });
}

