// features/analytics/insights.ts

import type { ActionableInsight, AnalyticsOverview } from "./types";

export const INSIGHT_THRESHOLDS = {
  MIN_QUESTIONS_FOR_DATA: 5,
  MIN_SCORE_FOR_STRENGTH: 70,
  MAX_SCORE_FOR_PRACTICE: 50,
};

/**
 * Pure, deterministic actionable insight generator that lives outside React components.
 * Operates on pre-aggregated server analytics data with zero duplicate math.
 */
export function deriveActionableInsights(data: AnalyticsOverview): ActionableInsight[] {
  // If the server has already computed insights, return them directly
  if (data.insights && data.insights.length > 0) {
    return data.insights;
  }

  const insights: ActionableInsight[] = [];
  const { snapshot, trend, weaknesses, strengths, subjects, journeyProgress } = data;

  // Rule 1: Insufficient data
  if (
    snapshot.questionsCompleted < INSIGHT_THRESHOLDS.MIN_QUESTIONS_FOR_DATA ||
    snapshot.quizzesCompleted === 0
  ) {
    return [
      {
        id: "insight-insufficient-data",
        type: "INSUFFICIENT_DATA",
        message: "Complete more questions to unlock insights.",
        actionLabel: "Start Practicing",
        actionUrl: "/study",
        priority: 1,
      },
    ];
  }

  // Rule 2: Topic needing practice
  const qualifiedWeakness = weaknesses?.find(
    (w) =>
      w.hasSufficientData !== false &&
      (w.questionCount ?? 0) >= INSIGHT_THRESHOLDS.MIN_QUESTIONS_FOR_DATA &&
      (w.accuracy ?? w.averageScore) < INSIGHT_THRESHOLDS.MAX_SCORE_FOR_PRACTICE,
  );

  if (qualifiedWeakness) {
    insights.push({
      id: `insight-practice-${qualifiedWeakness.topicId}`,
      type: "TOPIC_PRACTICE",
      message: `${qualifiedWeakness.topicName} could use more practice.`,
      actionLabel: "Practice this topic",
      actionUrl: qualifiedWeakness.subjectId
        ? `/study/quiz?subjectId=${encodeURIComponent(qualifiedWeakness.subjectId)}&topicId=${encodeURIComponent(qualifiedWeakness.topicId)}`
        : `/study/quiz?topicId=${encodeURIComponent(qualifiedWeakness.topicId)}`,
      priority: 1,
    });
  }

  // Rule 3: Accuracy improving
  const isImproving =
    trend?.trendDirection === "IMPROVING" ||
    (trend?.percentageChange !== null &&
      trend?.percentageChange !== undefined &&
      trend.percentageChange > 0);

  if (isImproving) {
    insights.push({
      id: "insight-trend-improving",
      type: "TREND_IMPROVING",
      message: "Your accuracy is improving.",
      actionLabel: journeyProgress?.nextRecommendedLevel?.actionUrl ? "Continue Journey" : "Keep practicing",
      actionUrl: journeyProgress?.nextRecommendedLevel?.actionUrl || "/study",
      priority: 2,
    });
  }

  // Rule 4: Strongest performance
  const bestSubject = subjects
    ?.filter(
      (s) =>
        (s.questionCount ?? 0) >= INSIGHT_THRESHOLDS.MIN_QUESTIONS_FOR_DATA &&
        ((s.accuracy ?? s.averageScore) ?? 0) >= INSIGHT_THRESHOLDS.MIN_SCORE_FOR_STRENGTH,
    )
    .sort((a, b) => ((b.accuracy ?? b.averageScore) ?? 0) - ((a.accuracy ?? a.averageScore) ?? 0))[0];

  const bestStrengthTopic = strengths?.find(
    (s) =>
      s.hasSufficientData !== false &&
      (s.questionCount ?? 0) >= INSIGHT_THRESHOLDS.MIN_QUESTIONS_FOR_DATA &&
      (s.accuracy ?? s.averageScore) >= INSIGHT_THRESHOLDS.MIN_SCORE_FOR_STRENGTH,
  );

  if (bestSubject) {
    insights.push({
      id: `insight-strong-subject-${bestSubject.id}`,
      type: "STRONG_PERFORMANCE",
      message: `You're strongest in ${bestSubject.name}.`,
      actionLabel: "Review",
      actionUrl: "/study",
      priority: 3,
    });
  } else if (bestStrengthTopic) {
    insights.push({
      id: `insight-strong-topic-${bestStrengthTopic.topicId}`,
      type: "STRONG_PERFORMANCE",
      message: `You're strongest in ${bestStrengthTopic.topicName}.`,
      actionLabel: "Review topic",
      actionUrl: bestStrengthTopic.subjectId
        ? `/study/quiz?subjectId=${encodeURIComponent(bestStrengthTopic.subjectId)}&topicId=${encodeURIComponent(bestStrengthTopic.topicId)}`
        : `/study/quiz?topicId=${encodeURIComponent(bestStrengthTopic.topicId)}`,
      priority: 3,
    });
  }

  insights.sort((a, b) => a.priority - b.priority);

  return insights;
}
