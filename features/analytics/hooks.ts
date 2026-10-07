import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from './api';

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
    refetchInterval: (query) => {
      const d = query.state.data;
      if (d?.isCalculating || (d?.hasCompletedAttempts && d?.snapshot?.quizzesCompleted === 0)) {
        return 2500;
      }
      return false;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

