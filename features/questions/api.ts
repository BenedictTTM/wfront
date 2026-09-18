// features/questions/api — question CRUD and review workflow calls
// Requires content:create (Teacher), content:publish (Admin)

import type { CreateQuestionPayload, Question, UpdateQuestionPayload } from "./types";

export async function getMyQuestions(): Promise<Question[]> {
  /* TODO: cursor-paginated */
  return [];
}

export async function getQuestion(_questionId: string): Promise<Question | null> {
  /* TODO */
  return null;
}

export async function createQuestion(_data: CreateQuestionPayload): Promise<Question | null> {
  /* TODO */
  return null;
}

export async function updateQuestion(
  _questionId: string,
  _data: UpdateQuestionPayload
): Promise<Question | null> {
  /* TODO */
  return null;
}

export async function submitQuestionForReview(_questionId: string): Promise<void> {
  /* TODO */
}

export async function approveQuestion(_questionId: string): Promise<void> {
  /* TODO: content:publish */
}

export async function rejectQuestion(_questionId: string, _reason: string): Promise<void> {
  /* TODO: content:publish */
}

export async function getReviewQueue(): Promise<Question[]> {
  /* TODO: Admin only, cursor-paginated */
  return [];
}
