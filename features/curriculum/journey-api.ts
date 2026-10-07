import { apiGet, apiPost } from "@/lib/api-client";
import {
  LearningJourney,
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

