// features/mock-exam/types.ts
// Full type definitions for Mock Exam + LockIn™ session

// ── MockExam ──────────────────────────────────────────────────────────────────

export type MockExamStatus =
  | 'ONGOING'
  | 'DISCONNECTED_GRACE'
  | 'AUTO_SUBMITTED'
  | 'COMPLETED';

export type MockExamConfig = {
  id: string;
  subjectId: string;
  title: string;
  durationSeconds: number;
  questionCount: number;
  createdAt: string;
};

export type MockExamAttempt = {
  id: string;
  quizAttemptId: string;
  subjectId: string;
  status: MockExamStatus;
  /** Server-authoritative seconds remaining — never derive from local clock */
  secondsRemaining: number;
  durationSeconds: number;
  flagCount: number;
  startedAt: string;
  completedAt?: string | null;
};

export type HeartbeatResponse = {
  status: MockExamStatus;
  secondsRemaining: number;
};

export type CreateMockExamPayload = {
  mockExamConfigId: string;
};

export type MockExamAnswer = {
  questionId: string;
  selectedOptionId?: string;
  submittedText?: string;
  flagSignal?: string;
};

export type MockExamAnswerResponse = {
  id: string;
  quizAttemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  submittedText?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MockExamScoredAnswer = {
  questionId: string;
  selectedOptionId?: string | null;
  submittedText?: string | null;
  isCorrect: boolean;
  correctOption: string;
  questionSnapshot: Record<string, any>;
};

export type MockExamSubmitResult = {
  id: string;
  quizAttemptId: string;
  status: MockExamStatus;
  score: number;
  xpAwarded: number;
  scoredAnswers: MockExamScoredAnswer[];
  startedAt: string;
  completedAt: string;
};

export type MockExamSummary = {
  id: string;
  subjectId: string;
  status: MockExamStatus;
  score?: number | null;
  startedAt: string;
  completedAt?: string | null;
};

export type MockExamListResponse = {
  data: MockExamSummary[];
  nextCursor: string | null;
};

// ── LockIn™ Session ───────────────────────────────────────────────────────────

export type LockInSessionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type LockInEventType =
  | 'FOCUS_LOST'
  | 'FOCUS_RETURNED'
  | 'FULLSCREEN_EXIT'
  | 'FULLSCREEN_ENTER'
  | 'HEARTBEAT_MISSED'
  | 'SESSION_FAILED'
  | 'SESSION_COMPLETED'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR';

export type LockInSession = {
  id: string;
  userId: string;
  mockExamId: string;
  status: LockInSessionStatus;
  failureReason?: string | null;
  heartbeatCount: number;
  interruptionCount: number;
  focusScore: number;
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
};

export type LockInHeartbeatPayload = {
  visibility: boolean;
  focused: boolean;
  fullscreen: boolean;
  elapsedSeconds: number;
};

export type LockInHeartbeatAction = 'CONTINUE' | 'WARN' | 'TERMINATE';

export type LockInHeartbeatResponse = {
  status: LockInSessionStatus;
  action: LockInHeartbeatAction;
  heartbeatCount: number;
};

// ── UI State Machine ───────────────────────────────────────────────────────────

export type MockExamPhase =
  | 'IDLE'           // No config selected yet — show config picker
  | 'CONFIG_SELECTED' // Config picked, energy check passed
  | 'COMMITMENT'     // CommitmentScreen shown, waiting for "Begin"
  | 'INITIALIZING'   // Creating exam + LockIn session on backend
  | 'ACTIVE_EXAM'    // Exam is in progress under LockIn™ monitoring
  | 'TERMINATED'     // Session ended due to focus violation
  | 'COMPLETED';     // Exam submitted successfully

export type AnswersMap = Record<
  string,
  { selectedOptionId?: string; submittedText?: string }
>;
