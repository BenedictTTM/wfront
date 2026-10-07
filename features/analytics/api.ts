import { apiGet } from '@/lib/api-client';
import type { AnalyticsOverview } from './types';

/**
 * Fetch unified student performance and learning insights overview.
 * Supports period filter ('7d', '14d', '30d', 'all') and optional subjectId scoping.
 */
export async function getAnalyticsOverview(
  subjectId?: string,
  period?: string,
): Promise<AnalyticsOverview> {
  const queryParams = new URLSearchParams();
  if (subjectId) queryParams.set('subjectId', subjectId);
  if (period) queryParams.set('period', period);
  const qs = queryParams.toString();
  return apiGet<AnalyticsOverview>(`/users/me/analytics/overview${qs ? `?${qs}` : ''}`);
}

