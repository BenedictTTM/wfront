import { useQuery } from "@tanstack/react-query";
import { getSubjects, getTopics } from "./api";

export function useSubjects() {
  return useQuery({
    queryKey: ["curriculum", "subjects"],
    queryFn: getSubjects,
    staleTime: Infinity,
  });
}

export function useTopics(subjectId: string) {
  return useQuery({
    queryKey: ["curriculum", "topics", subjectId],
    queryFn: () => getTopics(subjectId),
    enabled: !!subjectId,
    staleTime: Infinity,
  });
}

