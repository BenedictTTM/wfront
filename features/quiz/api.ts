// features/quiz/api — quiz attempt and answer API calls
// Answers require Idempotency-Key (see lib/idempotency.ts + useIdempotentMutation)
// TODO: implement
export async function createQuizAttempt(_config: unknown): Promise<void> { /* TODO */ }
export async function submitQuizAnswer(_attemptId: string, _answer: unknown): Promise<void> { /* TODO: requires Idempotency-Key */ }
export async function getQuizAttempt(_attemptId: string): Promise<void> { /* TODO */ }
