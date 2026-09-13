import { apiGet, apiPost } from "@/lib/api-client";
import {
  CreateAttemptPayload,
  QuizAttempt,
  QuizAnswer,
  AttemptAnswerResponseDto,
  SubmitAttemptResponseDto,
  AttemptListResponseDto,
  FlashcardListResponse,
} from "./types";

export async function createQuizAttempt(payload: CreateAttemptPayload): Promise<QuizAttempt> {
  return apiPost<QuizAttempt>("/quiz-attempts", payload);
}

export async function getQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  return apiGet<QuizAttempt>(`/quiz-attempts/${attemptId}`);
}

export async function submitQuizAnswer(
  attemptId: string,
  answer: QuizAnswer,
  idempotencyKey: string
): Promise<AttemptAnswerResponseDto> {
  return apiPost<AttemptAnswerResponseDto>(`/quiz-attempts/${attemptId}/answers`, answer, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export async function submitQuizAttempt(attemptId: string): Promise<SubmitAttemptResponseDto> {
  return apiPost<SubmitAttemptResponseDto>(`/quiz-attempts/${attemptId}/submit`);
}

export async function listQuizAttempts(query?: {
  limit?: number;
  cursor?: string;
}): Promise<AttemptListResponseDto> {
  const searchParams = new URLSearchParams();
  if (query?.limit) searchParams.set("limit", String(query.limit));
  if (query?.cursor) searchParams.set("cursor", query.cursor);
  const queryString = searchParams.toString();
  return apiGet<AttemptListResponseDto>(`/quiz-attempts${queryString ? `?${queryString}` : ""}`);
}

export async function getFlashcardsForAttempt(attemptId: string): Promise<FlashcardListResponse> {
  return apiGet<FlashcardListResponse>(`/quiz-attempts/${attemptId}/flashcards`);
}

export async function abandonQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  return apiPost<QuizAttempt>(`/quiz-attempts/${attemptId}/abandon`);
}


