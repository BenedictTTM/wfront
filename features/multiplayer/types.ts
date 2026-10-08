export type MatchState =
  | 'LOBBY'
  | 'STARTING'
  | 'QUESTION_ACTIVE'
  | 'ROUND_REVEAL'
  | 'FINISHED'
  | 'ABANDONED';

export type MatchQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  timeLimitMs: number;
  explanation?: string;
};

export type ParticipantState = {
  id: string;
  name: string;
  gamerTag?: string;
  avatarUrl?: string | null;
  school?: {
    name: string;
    shortCode: string;
    crestUrl: string | null;
    region?: string | null;
    motto?: string | null;
  };
  score: number;
  isConnected: boolean;
  rank?: number;
  isWinner?: boolean;
  status?: "THINKING" | "LOCKED_IN";
};

export type RoundResult = {
  participantId: string;
  isCorrect: boolean;
  pointsEarned: number;
  speedBonus: number;
  streakBonus: number;
  newScore: number;
  newStreak: number;
};

export type RoomState = {
  roomId: string;
  state: MatchState;
  participants: ParticipantState[];
  currentQuestionIndex: number;
  totalQuestions: number;
};

// ── WS event payloads (server → client) ──────────────────────────────────

export type WsMatchFoundEvent = {
  matchId: string;
  roomId: string;
  subjectId: string;
};

export type WsRoomStateEvent = RoomState;

export type WsMatchCountdownEvent = {
  seconds: number;
};

export type WsQuestionStartEvent = {
  questionIndex: number;
  totalQuestions: number;
  question: MatchQuestion;
};

export type WsRoundRevealEvent = {
  correctOptionId: string;
  results: RoundResult[];
  explanation?: string;
};

export type WsMatchEndEvent = {
  matchId: string;
  rankings: Array<{
    participantId: string;
    name: string;
    score: number;
    rank: number;
    isWinner: boolean;
    eloDelta?: number;
    ratingAfter?: number;
  }>;
};

export type WsErrorEvent = {
  code: string;
  message: string;
};

// ── REST types ────────────────────────────────────────────────────────────

export type QueueStatus = {
  inQueue: boolean;
  waitingSince?: string;
  subjectId?: string;
  /** Populated when a match is found — navigate to /study/multiplayer/:matchId */
  matchId?: string;
};

export type JoinQueuePayload = {
  subjectId: string;
};

export type MatchResult = {
  matchId: string;
  roomId: string;
  subjectId: string | null;
  status: string;
  participants: Array<{
    userId: string;
    score: number;
    rank: number;
    isWinner: boolean;
  }>;
  startedAt: string | null;
  endedAt: string | null;
};

// ── Composite types used by both hook and components ──────────────────────

export type RoundRevealData = {
  correctOptionId: string;
  results: RoundResult[];
  explanation?: string;
};

export type MatchEndData = {
  matchId: string;
  rankings: WsMatchEndEvent["rankings"];
};
