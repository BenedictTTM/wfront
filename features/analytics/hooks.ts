// features/analytics/hooks.ts — TanStack Query hooks for analytics
// staleTime: 5 * 60 * 1000 (5 min) — pre-aggregated table, optimized caching

import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsOverview,
  getAnalyticsSummary,
  getStrongTopics,
  getWeakTopics,
} from './api';

export function useAnalyticsOverview(
  subjectId?: string,
  period?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'overview', subjectId ?? 'all', period ?? 'default'],
    queryFn: () => getAnalyticsOverview(subjectId, period),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 or 403
      if (error?.status === 401 || error?.status === 403 || error?.code === 'FORBIDDEN') return false;
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useAnalyticsSummary(
  params?: { subjectId?: string; topicId?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'summary', params?.subjectId ?? 'all', params?.topicId ?? 'all'],
    queryFn: () => getAnalyticsSummary(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });
}

export function useWeakTopics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['analytics', 'weak-topics'],
    queryFn: getWeakTopics,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });
}

export function useStrongTopics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['analytics', 'strong-topics'],
    queryFn: getStrongTopics,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });
}
