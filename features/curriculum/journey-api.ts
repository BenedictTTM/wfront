// features/curriculum/journey-api.ts

import { apiGet, apiPost } from "@/lib/api-client";
import {
  CurrentJourneyProgress,
  LearningJourney,
  NextChallenge,
  RecordCompletionResponse,
  StartNodeSessionResponse,
  SubjectJourney,
} from "./types";

export async function getSubjectJourney(subjectSlug: string): Promise<SubjectJourney> {
  return apiGet<SubjectJourney>(`/subjects/${subjectSlug}/journey`);
}

export async function startJourneyNodeSession(nodeId: string): Promise<StartNodeSessionResponse> {
  return apiPost<StartNodeSessionResponse>(`/journey/nodes/${nodeId}/start`, {});
}

// ── Structured Learning Journey Progression Map APIs ─────────────────────────

export async function getLearningJourney(subjectSlug: string): Promise<LearningJourney> {
  return apiGet<LearningJourney>(`/subjects/${subjectSlug}/journey-tree`);
}

export async function getJourneyProgress(journeyId: string): Promise<CurrentJourneyProgress> {
  return apiGet<CurrentJourneyProgress>(`/journey/${journeyId}/progress`);
}

export async function getNextChallenge(levelId: string): Promise<NextChallenge> {
  return apiGet<NextChallenge>(`/journey/levels/${levelId}/challenge`);
}

export async function recordLevelCompletion(
  levelId: string,
  data: { score: number; idempotencyKey: string; attemptId?: string },
): Promise<RecordCompletionResponse> {
  return apiPost<RecordCompletionResponse>(`/journey/levels/${levelId}/complete`, data);
}
