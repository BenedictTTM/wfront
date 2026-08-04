// features/mock-exam/api.ts
// Full API client for Mock Exam + LockIn™ session endpoints

import { apiGet, apiPost } from '@/lib/api-client';
import {
  MockExamConfig,
  MockExamAttempt,
  HeartbeatResponse,
  CreateMockExamPayload,
  MockExamAnswer,
  MockExamAnswerResponse,
  MockExamSubmitResult,
  MockExamListResponse,
  LockInSession,
  LockInHeartbeatPayload,
  LockInHeartbeatResponse,
  LockInEventType,
} from './types';

// ── Mock Exam Configs ─────────────────────────────────────────────────────────

export async function listMockExamConfigs(
  subjectId?: string,
): Promise<MockExamConfig[]> {
  const qs = subjectId ? `?subjectId=${subjectId}` : '';
  return apiGet<MockExamConfig[]>(`/mock-exam-configs${qs}`);
}

// ── Mock Exam Session ─────────────────────────────────────────────────────────

export async function createMockExam(
  payload: CreateMockExamPayload,
): Promise<MockExamAttempt> {
  return apiPost<MockExamAttempt>('/mock-exams', payload);
}

export async function getMockExam(examId: string): Promise<MockExamAttempt> {
  return apiGet<MockExamAttempt>(`/mock-exams/${examId}`);
}

export async function sendMockExamHeartbeat(
  examId: string,
): Promise<HeartbeatResponse> {
  return apiPost<HeartbeatResponse>(`/mock-exams/${examId}/heartbeat`);
}

export async function upsertMockExamAnswer(
  examId: string,
  answer: MockExamAnswer,
  idempotencyKey: string,
): Promise<MockExamAnswerResponse> {
  return apiPost<MockExamAnswerResponse>(
    `/mock-exams/${examId}/answers`,
    answer,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
}

export async function submitMockExam(
  examId: string,
): Promise<MockExamSubmitResult> {
  return apiPost<MockExamSubmitResult>(`/mock-exams/${examId}/submit`);
}

export async function listMockExams(query?: {
  limit?: number;
  cursor?: string;
}): Promise<MockExamListResponse> {
  const sp = new URLSearchParams();
  if (query?.limit) sp.set('limit', String(query.limit));
  if (query?.cursor) sp.set('cursor', query.cursor);
  const qs = sp.toString();
  return apiGet<MockExamListResponse>(`/mock-exams${qs ? `?${qs}` : ''}`);
}

// ── LockIn™ Session ───────────────────────────────────────────────────────────

export async function createLockInSession(
  mockExamId: string,
): Promise<LockInSession> {
  return apiPost<LockInSession>('/lockin/sessions', { mockExamId });
}

export async function getLockInSessionByExam(
  mockExamId: string,
): Promise<LockInSession> {
  return apiGet<LockInSession>(`/lockin/sessions/by-exam/${mockExamId}`);
}

export async function sendLockInHeartbeat(
  sessionId: string,
  payload: LockInHeartbeatPayload,
): Promise<LockInHeartbeatResponse> {
  return apiPost<LockInHeartbeatResponse>(
    `/lockin/sessions/${sessionId}/heartbeat`,
    payload,
  );
}

export async function recordLockInEvent(
  sessionId: string,
  eventType: LockInEventType,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await apiPost<void>(`/lockin/sessions/${sessionId}/events`, {
    eventType,
    metadata: metadata ?? {},
  });
}

export async function terminateLockInSession(
  sessionId: string,
  reason: string,
): Promise<void> {
  await apiPost<void>(`/lockin/sessions/${sessionId}/terminate`, { reason });
}

export async function completeLockInSession(
  sessionId: string,
): Promise<LockInSession> {
  return apiPost<LockInSession>(`/lockin/sessions/${sessionId}/complete`);
}
