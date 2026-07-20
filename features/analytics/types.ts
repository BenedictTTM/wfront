// features/analytics — student performance analytics (pre-aggregated summaries)
// staleTime: ~5min per architecture doc §5.2 (AnalyticsSummary is a pre-aggregated table)
// TODO: implement
export type AnalyticsSummary = {
  subjectId?: string;
  topicId?: string;
  accuracy: number;
  totalAttempts: number;
  // TODO: confirm full shape from endpoint
};
