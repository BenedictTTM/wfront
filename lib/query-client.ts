// lib/query-client.ts — TanStack Query client configuration
// Sourced here so providers.tsx and server-side helpers share the same config.
// Strategy per architecture doc §5.2:
//   - Default staleTime: 60s (override per-query for curriculum/live records)
//   - Retry: 2 retries on network errors; never retry on ApiError (4xx are deterministic)
//   - gcTime: 5min default
// TODO: finalize retry predicate once ApiError is implemented in lib/api-client.ts

import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min default; override per-feature
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          // TODO: never retry ApiError (4xx); retry up to 2x on network errors
          if (error instanceof Error && error.name === "ApiError") return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false, // override to true for quiz/mock-exam live records
      },
      mutations: {
        retry: false,
      },
    },
  });
}
