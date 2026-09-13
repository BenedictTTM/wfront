export type AttemptMode = "JOURNEY" | "PRACTICE" | "EXAM";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";

export type CreateAttemptPayload = {
  mode: AttemptMode;
  subjectId: string;
  topicId?: string;
  subtopicId?: string;
  journeyId?: string;
  levelId?: string;
  challengeId?: string;
};

export type QuestionOptionDto = {
  key: string;
  text: string;
};

export type AttemptQuestionDto = {
  id: string;
  text: string;
  options: QuestionOptionDto[];
  explanation?: string | null;
  difficulty: string;
  type: string;
};

export type AttemptAnswerResponseDto = {
  id: string;
  quizAttemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  submittedText?: string | null;
  isCorrect?: boolean;
  correctOption?: string;
  explanation?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuizAttempt = {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  subjectId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  journeyId?: string | null;
  levelId?: string | null;
  challengeId?: string | null;
  questions: AttemptQuestionDto[];
  answers: AttemptAnswerResponseDto[];
  startedAt: string;
  completedAt?: string | null;
};

export type QuizAnswer = {
  questionId: string;
  selectedOptionId?: string;
  submittedText?: string;
};

export type ScoredAnswerDto = {
  questionId: string;
  selectedOptionId?: string | null;
  submittedText?: string | null;
  isCorrect: boolean;
  correctOption: string;
  questionSnapshot: Record<string, any>;
};

export type JourneyAttemptOutcome = {
  levelId: string;
  isPassed: boolean;
  masteryStarsEarned: number;
  xpEarned: number;
  unlockedNextLevel: boolean;
  nextLevelId?: string | null;
  nextLevelTitle?: string | null;
  nextLevelPrerequisitesMet?: boolean;
  summaryMessage: string;
};

export type SubmitAttemptResponseDto = {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  subjectId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  journeyId?: string | null;
  levelId?: string | null;
  challengeId?: string | null;
  score: number;
  isFirstAttempt: boolean;
  xpAwarded: number;
  scoredAnswers: ScoredAnswerDto[];
  startedAt: string;
  completedAt: string;
  journeyOutcome?: JourneyAttemptOutcome | null;
};

export type AttemptSummaryDto = {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  subjectId: string;
  score: number;
  startedAt: string;
  completedAt?: string | null;
};

export type AttemptListResponseDto = {
  data: AttemptSummaryDto[];
  nextCursor: string | null;
};

export type FlashcardDto = {
  id: string;
  questionId: string;
  front: string;
  back: string;
  explanation?: string | null;
  difficulty?: "easy" | "medium" | "hard" | string | null;
  topic?: string | null;
};

export type FlashcardListResponse = {
  flashcards: FlashcardDto[];
};


