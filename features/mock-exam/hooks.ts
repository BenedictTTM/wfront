// features/mock-exam/hooks — TanStack Query + state machine hooks
// staleTime: 0, refetchOnWindowFocus: true (live in-progress records)
// Includes: heartbeat interval hook, tab-blur/paste event capture
// TODO: implement state machine reducer (in_progress ⇄ disconnected_grace → auto_submitted | completed)
export function useMockExamAttempt(_attemptId: string) { /* TODO */ }
export function useMockExamStateMachine(_attemptId: string) { /* TODO: reducer + heartbeat interval */ }
export function useSubmitMockExamAnswer() { /* TODO: useIdempotentMutation */ }
