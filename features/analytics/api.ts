// features/analytics/api.ts — student performance and learning insights API calls

import { apiGet } from '@/lib/api-client';
import type {
  AnalyticsOverview,
  AnalyticsSummaryItem,
  TopicStrengthWeakness,
} from './types';

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

/**
 * Fetch raw daily analytics summaries.
 */
export async function getAnalyticsSummary(params?: {
  subjectId?: string;
  topicId?: string;
}): Promise<AnalyticsSummaryItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.subjectId) queryParams.set('filter[subjectId]', params.subjectId);
  if (params?.topicId) queryParams.set('filter[topicId]', params.topicId);
  const qs = queryParams.toString();
  return apiGet<AnalyticsSummaryItem[]>(`/users/me/analytics/summary${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch weak topics.
 */
export async function getWeakTopics(): Promise<TopicStrengthWeakness[]> {
  return apiGet<TopicStrengthWeakness[]>('/users/me/analytics/weak-topics');
}

/**
 * Fetch strong topics.
 */
export async function getStrongTopics(): Promise<TopicStrengthWeakness[]> {
  return apiGet<TopicStrengthWeakness[]>('/users/me/analytics/strong-topics');
}
