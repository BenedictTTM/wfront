export type AttemptMode = "PRACTICE" | "EXAM";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";

export type CreateAttemptPayload = {
  mode: AttemptMode;
  subjectId: string;
  topicId?: string;
  subtopicId?: string;
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

export type SubmitAttemptResponseDto = {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  subjectId: string;
  topicId?: string | null;
  subtopicId?: string | null;
  score: number;
  isFirstAttempt: boolean;
  xpAwarded: number;
  scoredAnswers: ScoredAnswerDto[];
  startedAt: string;
  completedAt: string;
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

