// features/curriculum/types.ts — subjects, topics, subtopics types

import type { QuestionOption } from "@/features/quiz/types";

export type Subject = {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string;
  createdAt: string;
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  subjectId: string;
  createdAt: string;
};

export type Subtopic = {
  id: string;
  name: string;
  slug: string;
  topicId: string;
  createdAt: string;
};

export type SubjectDetails = Subject & {
  topics: (Topic & { subtopics?: Subtopic[] })[];
};

export type Pdf = {
  id: string;
  status: "processing" | "published" | "processing_failed";
};

// ── Learning Path ──────────────────────────────────────────────────────────

export type LearningPathNodeStatus = "COMPLETED" | "CURRENT" | "LOCKED";

export type LearningPathNode = {
  subtopic: { id: string; name: string; slug: string };
  status: LearningPathNodeStatus;
  order: number;
};

export type LearningPathSection = {
  topic: { id: string; name: string; slug: string; order: number };
  totalSubtopics: number;
  completedSubtopics: number;
  nodes: LearningPathNode[];
};

export type LearningPath = {
  subject: { id: string; name: string; slug: string };
  sections: LearningPathSection[];
  totalNodes: number;
  completedNodes: number;
};

// ── Journey Domain Types ──────────────────────────────────────────────────

export type JourneyNodeType = 'LESSON' | 'PRACTICE' | 'MASTERY_CHECKPOINT' | 'BOSS_CHALLENGE';

export type JourneyNode = {
  id: string;
  unitId: string;
  subtopicId?: string | null;
  title: string;
  description?: string | null;
  type: JourneyNodeType;
  orderIndex: number;
  requiredPassingScore: number;
  xpReward: number;
  status: 'LOCKED' | 'UNLOCKED' | 'COMPLETED';
  masteryStars: number;
  bestScore: number;
  attemptsCount: number;
  completedAt?: string | null;
};

export type JourneyUnit = {
  id: string;
  subjectId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  nodes: JourneyNode[];
  totalNodes: number;
  completedNodes: number;
};

export type SubjectJourney = {
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  units: JourneyUnit[];
  totalNodes: number;
  completedNodes: number;
  overallMasteryPercent: number;
  currentNodeId: string | null;
};

export type StartNodeSessionResponse = {
  attemptId: string;
  nodeId: string;
  subjectId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  remainingEnergy: number;
};

// ── Structured Learning Journey Progression Map Types ────────────────────────

export type LevelProgressState =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'MASTERED';

export type ChallengeType =
  | 'PRACTICE'
  | 'QUIZ'
  | 'SPEED_ROUND'
  | 'BOSS_BATTLE';

export type JourneyLevelItem = {
  id: string;
  stageId: string;
  topicId?: string | null;
  topicTitle?: string | null;
  subtopicId?: string | null;
  prerequisiteLevelId?: string | null;
  title: string;
  description?: string | null;
  orderIndex: number;
  requiredPassingScore: number;
  masteryScoreThreshold: number;
  xpReward: number;
  masteryXpBonus: number;
  state: LevelProgressState;
  masteryStars: number;
  bestScore: number;
  attemptsCount: number;
  isCompleted: boolean;
  isMastered: boolean;
  completedAt?: string | null;
  masteredAt?: string | null;
  challengesCount: number;
};

export type JourneyStageItem = {
  id: string;
  journeyId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  levels: JourneyLevelItem[];
};

export type LearningJourney = {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  title: string;
  description?: string | null;
  stages: JourneyStageItem[];
  currentLevelId: string | null;
  totalLevels: number;
  completedLevels: number;
  masteredLevels: number;
  completionPercentage: number;
};

export type CurrentJourneyProgress = {
  journeyId: string;
  subjectSlug: string;
  currentLevel: JourneyLevelItem | null;
  totalLevels: number;
  completedLevels: number;
  masteredLevels: number;
  completionPercentage: number;
  totalXpEarned: number;
};

export type NextChallenge = {
  levelId: string;
  levelTitle: string;
  challengeId?: string;
  challengeTitle: string;
  challengeType: ChallengeType;
  questionCount: number;
  timeLimitSeconds?: number | null;
  questions: Array<{
    id: string;
    text: string;
    options: QuestionOption[];
    difficulty: string;
    type: string;
  }>;
};

export type RecordCompletionResponse = {
  levelId: string;
  state: LevelProgressState;
  score: number;
  isPassed: boolean;
  isMastered: boolean;
  masteryStars: number;
  xpAwarded: number;
  unlockedLevelIds: string[];
  isRetry: boolean;
  isFirstCompletion: boolean;
  isFirstMastery: boolean;
  idempotencyKey: string;
  alreadyProcessed?: boolean;
};


