// features/quiz/hooks — TanStack Query hooks for quiz sessions
// staleTime: short/none — these are live in-progress records (architecture doc §5.2)
// TODO: implement
export function useQuizAttempt(_attemptId: string) { /* TODO: staleTime: 0, refetchOnWindowFocus: true */ }
export function useCreateQuizAttempt() { /* TODO: useMutation */ }
export function useSubmitQuizAnswer() { /* TODO: useIdempotentMutation (lib/idempotency.ts) */ }
