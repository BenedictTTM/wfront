import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuizAttempt,
  getQuizAttempt,
  listQuizAttempts,
  submitQuizAnswer,
  submitQuizAttempt,
} from "./api";
import { CreateAttemptPayload, QuizAnswer } from "./types";

export function useQuizAttempt(attemptId: string) {
  return useQuery({
    queryKey: ["quiz", "attempt", attemptId],
    queryFn: () => getQuizAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 0,
  });
}

export function useCreateQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAttemptPayload) => createQuizAttempt(payload),
    onSuccess: () => {
      // Invalidate gamification and quest queries so energy deduction and quests sync automatically
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}

export function useSubmitQuizAnswer() {
  return useMutation({
    mutationFn: ({
      attemptId,
      answer,
      idempotencyKey,
    }: {
      attemptId: string;
      answer: QuizAnswer;
      idempotencyKey: string;
    }) => submitQuizAnswer(attemptId, answer, idempotencyKey),
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => submitQuizAttempt(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["quiz", "history"] });
    },
  });
}

export function useQuizAttemptsList(query?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ["quiz", "history", query],
    queryFn: () => listQuizAttempts(query),
    staleTime: 30 * 1000,
  });
}

