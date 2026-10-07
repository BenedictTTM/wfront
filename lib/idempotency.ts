// lib/idempotency.ts — Idempotency-Key generation and per-mutation cache
// Required by: quiz-attempts/:id/answers, mock-exams/:id/answers, both /attempts create endpoints
// Key is generated ONCE per logical action, reused across TanStack Query automatic retries.
// This prevents a network retry from becoming an IDEMPOTENCY_CONFLICT on the server.
// TODO: implement useIdempotentMutation wrapper once lib/api-client.ts is ready

/**
 * Generates a new idempotency key for a logical action.
 * Store this key; pass the same key on every retry of the same action.
 * Uses Web Crypto API (crypto.randomUUID) — available in Node 19+ and all modern browsers.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

