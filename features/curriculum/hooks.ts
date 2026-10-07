import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "./api";

export function useSubjects() {
  return useQuery({
    queryKey: ["curriculum", "subjects"],
    queryFn: getSubjects,
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}



