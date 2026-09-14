import { useQuery } from "@tanstack/react-query";
import { getSubjects, getTopics, getLearningPath } from "./api";

export function useSubjects() {
  return useQuery({
    queryKey: ["curriculum", "subjects"],
    queryFn: getSubjects,
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useTopics(subjectId: string) {
  return useQuery({
    queryKey: ["curriculum", "topics", subjectId],
    queryFn: () => getTopics(subjectId),
    enabled: !!subjectId,
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useLearningPath(subjectSlug: string) {
  return useQuery({
    queryKey: ["curriculum", "learning-path", subjectSlug],
    queryFn: () => getLearningPath(subjectSlug),
    enabled: !!subjectSlug,
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

