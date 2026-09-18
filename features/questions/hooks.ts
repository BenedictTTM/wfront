// features/questions/hooks — TanStack Query hooks for question authoring + review
// TODO: implement (includes useInfiniteQuery for cursor-paginated lists)
export function useMyQuestions() { /* TODO: useInfiniteQuery, nextCursor pagination */ }
/** Canonical alias for useMyQuestions */
export const useQuestions = useMyQuestions;
export function useQuestion(_questionId: string) { /* TODO */ }
export function useReviewQueue() { /* TODO: Admin only, useInfiniteQuery */ }
export function useApproveQuestion() { /* TODO: useMutation */ }
export function useRejectQuestion() { /* TODO: useMutation */ }
