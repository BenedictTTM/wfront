// features/analytics/hooks.ts — TanStack Query hooks for analytics
// staleTime: 5 * 60 * 1000 (5 min) — pre-aggregated table, optimized caching

import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsOverview,
  getAnalyticsSummary,
  getStrongTopics,
  getWeakTopics,
} from './api';

export function useAnalyticsOverview(subjectId?: string, period?: string) {
  return useQuery({
    queryKey: ['analytics', 'overview', subjectId ?? 'all', period ?? 'default'],
    queryFn: () => getAnalyticsOverview(subjectId, period),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsSummary(params?: { subjectId?: string; topicId?: string }) {
  return useQuery({
    queryKey: ['analytics', 'summary', params?.subjectId ?? 'all', params?.topicId ?? 'all'],
    queryFn: () => getAnalyticsSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeakTopics() {
  return useQuery({
    queryKey: ['analytics', 'weak-topics'],
    queryFn: getWeakTopics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStrongTopics() {
  return useQuery({
    queryKey: ['analytics', 'strong-topics'],
    queryFn: getStrongTopics,
    staleTime: 5 * 60 * 1000,
  });
}
