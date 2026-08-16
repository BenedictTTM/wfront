import { apiGet } from "@/lib/api-client";
import { Subject, Topic, LearningPath } from "./types";

export async function getSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>("/subjects");
}

export async function getTopics(subjectId: string): Promise<Topic[]> {
  if (!subjectId) return [];
  return apiGet<Topic[]>(`/subjects/${subjectId}/topics`);
}

export async function getLearningPath(subjectSlug: string): Promise<LearningPath> {
  return apiGet<LearningPath>(`/subjects/${subjectSlug}/learning-path`);
}
