// features/analytics/types.ts — student performance and learning insight analytics types

export type AnalyticsPeriod = '7d' | '14d' | '30d' | 'all';

export type PerformanceSnapshot = {
  overallAccuracy: number | null;
  questionsCompleted: number;
  quizzesCompleted: number;
  masteryPercentage: number | null;
  studyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  xpEarned: number;
  headline: string;
};

export type PerformanceTrendPoint = {
  date: string;
  averageScore: number;
  quizzesTaken: number;
  questionsCompleted?: number;
};

export type PerformanceTrend = {
  period?: string;
  history: PerformanceTrendPoint[];
  trendDirection: 'IMPROVING' | 'STEADY' | 'NEEDS_FOCUS' | 'NOT_ENOUGH_DATA';
  percentageChange: number | null;
  insight: string;
};

export type SubjectPerformanceItem = {
  id: string;
  name: string;
  code: string;
  slug: string;
  accuracy?: number | null;
  averageScore: number | null;
  mastery?: number | null;
  questionCount?: number;
  quizzesTaken: number;
  masteryLevel: string;
  completedLevels: number;
  totalLevels: number;
  progressPercentage?: number;
};

export type TopicStrengthWeakness = {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  accuracy?: number;
  averageScore: number;
  questionCount?: number;
  quizzesTaken: number;
  hasSufficientData?: boolean;
  actionLabel?: string;
  actionUrl?: string;
};

export type TopicMasteryBreakdownItem = {
  topicId: string;
  topicName: string;
  subjectId?: string;
  subjectName: string;
  mastery?: number;
  score: number;
  accuracy?: number;
  questionCount?: number;
  status: 'MASTERED' | 'PROFICIENT' | 'DEVELOPING' | 'NEEDS_PRACTICE';
};

export type TopicMasterySummary = {
  mastered: number;
  proficient: number;
  developing: number;
  needsPractice: number;
  total: number;
  breakdown: TopicMasteryBreakdownItem[];
};

export type JourneyNextLevel = {
  levelId: string;
  title: string;
  subjectSlug: string;
  subjectName: string;
  actionUrl: string;
};

export type SubjectJourneyProgress = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectSlug?: string;
  totalLevels: number;
  completedLevels: number;
  percentage: number;
};

export type JourneyProgressSummary = {
  totalLevels: number;
  completedLevels: number;
  masteredLevels: number;
  completionPercentage: number;
  bySubject?: SubjectJourneyProgress[];
  nextRecommendedLevel: JourneyNextLevel | null;
};

export type MultiplayerStats = {
  matchesPlayed: number;
  matchesWon: number;
  wins?: number;
  losses: number;
  winRate: number | null;
  currentRank?: number | null;
  recentRankMovement?: string | null;
};

export type ActionableInsight = {
  id: string;
  type: 'INSUFFICIENT_DATA' | 'TOPIC_PRACTICE' | 'TREND_IMPROVING' | 'STRONG_PERFORMANCE';
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: number;
};

export type AnalyticsOverview = {
  snapshot: PerformanceSnapshot;
  trend: PerformanceTrend;
  subjects: SubjectPerformanceItem[];
  strengths: TopicStrengthWeakness[];
  weaknesses: TopicStrengthWeakness[];
  topicMastery: TopicMasterySummary;
  journeyProgress: JourneyProgressSummary;
  multiplayer: MultiplayerStats | null;
  insights?: ActionableInsight[];
  selectedSubjectId: string | null;
  entitlementActive: boolean;
};

export type AnalyticsSummaryItem = {
  id: string;
  userId: string;
  subjectId?: string | null;
  topicId?: string | null;
  date: string;
  quizzesTaken: number;
  averageScore: number;
  studyTimeSeconds: number;
};
