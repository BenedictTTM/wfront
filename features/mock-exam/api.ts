// features/mock-exam/api — mock exam session API calls
// Heartbeat: POST /mock-exams/:id/heartbeat (30s interval)
// Answers: POST /mock-exams/:id/answers (requires Idempotency-Key)
// TODO: implement
export async function createMockExamAttempt(_config: unknown): Promise<void> { /* TODO: requires Idempotency-Key */ }
export async function getMockExamAttempt(_attemptId: string): Promise<void> { /* TODO */ }
export async function submitMockExamAnswer(_attemptId: string, _answer: unknown): Promise<void> { /* TODO: requires Idempotency-Key */ }
export async function sendHeartbeat(_attemptId: string): Promise<void> { /* TODO */ }
export async function submitMockExam(_attemptId: string): Promise<void> { /* TODO: irreversible once scored */ }
