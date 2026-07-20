// features/curriculum/hooks — TanStack Query hooks for curriculum data
// staleTime strategy per architecture doc §5.2:
//   subjects/topics/subtopics → staleTime: Infinity (CDN-edge cached)
//   PDF signedUrl             → staleTime: 0 (fresh per request, easy to cache accidentally)
// TODO: implement
export function useSubjects() { /* TODO */ }
export function useTopics(_subjectId: string) { /* TODO */ }
export function usePdf(_pdfId: string) { /* TODO */ }
export function usePdfPageUrl(_pdfId: string, _page: number) { /* TODO: staleTime: 0 — never cache */ }
