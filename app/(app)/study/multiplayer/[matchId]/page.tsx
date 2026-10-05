"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { useMultiplayerWs } from "@/features/multiplayer/use-multiplayer-ws";
import { MatchHUD } from "@/features/multiplayer/components/MatchHUD";
import { ParticipantRail } from "@/features/multiplayer/components/ParticipantRail";
import { LiveQuestion } from "@/features/multiplayer/components/LiveQuestion";
import { RoundEvaluationDrawer } from "@/features/multiplayer/components/RoundEvaluationDrawer";
import { ClutchStateBanner } from "@/features/multiplayer/components/ClutchStateBanner";
import { PostMatchSummary } from "@/features/multiplayer/components/PostMatchSummary";
import { MatchResults } from "@/features/multiplayer/components/MatchResults";
import { MatchmakingLobby } from "@/features/multiplayer/components/MatchmakingLobby";
import { toast } from "sonner";
import {
  useMatchmaking,
  useMatchResult,
  useMultiplayerToken,
  useStreak,
} from "@/features/multiplayer/hooks";
import { useSubjects } from "@/features/curriculum/hooks";

function getAcademicConceptExplanation(
  questionText?: string,
  serverExplanation?: string,
  roundRevealExplanation?: string
): string {
  if (roundRevealExplanation && roundRevealExplanation.trim().length > 0) {
    return roundRevealExplanation;
  }
  if (serverExplanation && serverExplanation.trim().length > 0) {
    return serverExplanation;
  }

  const text = (questionText || "").toLowerCase();

  // WASSCE / SHS English Grammar & Academic Concept Rules
  if (
    text.includes("kilometer") ||
    text.includes("mile") ||
    text.includes("meter") ||
    text.includes("too far to walk")
  ) {
    return "Grammar Rule: Measurements of distance (e.g., 'ten kilometers') take a singular verb when considered as a single unit or quantity.";
  }
  if (
    text.includes("dollar") ||
    text.includes("cedi") ||
    text.includes("naira") ||
    text.includes("money") ||
    text.includes("too much to spend")
  ) {
    return "Grammar Rule: Sums of money and durations of time function as singular collective units and require a singular verb.";
  }
  if (
    text.includes("each") ||
    text.includes("every") ||
    text.includes("neither") ||
    text.includes("either")
  ) {
    return "Grammar Rule: Singular indefinite pronouns ('each', 'neither', 'either') strictly require singular verbs regardless of intervening plural prepositional phrases.";
  }
  if (
    text.includes("if it rains") ||
    text.includes("conditional") ||
    text.includes("tomorrow, we")
  ) {
    return "Grammar Rule: First conditional structures pair the simple present tense in the 'if' clause with 'will + base verb' in the main clause.";
  }
  if (
    text.includes("mitochondria") ||
    text.includes("cellular") ||
    text.includes("atp")
  ) {
    return "Biology Rule: Mitochondria synthesize the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation during aerobic respiration.";
  }
  if (
    text.includes("farad") ||
    text.includes("capacit") ||
    text.includes("electric")
  ) {
    return "Physics Rule: Capacitance (C = Q/V) is the ratio of stored electric charge to the potential difference across conductors, measured in farads (F).";
  }
  if (
    text.includes("chain rule") ||
    text.includes("ln(") ||
    text.includes("derivative")
  ) {
    return "Calculus Rule: By the logarithmic chain rule, d/dx[ln(u)] = u'/u for any differentiable function u(x).";
  }

  return "Grammar Rule: Concord requires singular verbs for measurements of quantity, distance, or time regarded as an unbroken whole.";
}

export default function LiveMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();

  const { data: authData } = useMultiplayerToken();
  const token = authData?.token ?? null;
  const currentUserId = authData?.currentUserId ?? null;

  const { data: subjects } = useSubjects();
  const { data: matchResult } = useMatchResult(matchId);

  // Matchmaking hook scoped to find another match (excluding current completed match)
  const {
    isSearching,
    queueStatus,
    joinError: rematchError,
    startSearch,
    cancelSearch,
    isJoining: isRematching,
    isLeaving: isCancellingRematch,
  } = useMatchmaking(matchId);

  // Determine active subject from match result, session cache, or fallback to first subject
  const cachedSubjectId =
    typeof window !== "undefined" ? sessionStorage.getItem("mp_last_subject_id") : null;
  const resolvedSubjectId = matchResult?.subjectId || cachedSubjectId || null;
  const activeSubject =
    (resolvedSubjectId ? subjects?.find((s) => s.id === resolvedSubjectId) : null) ??
    subjects?.[0] ??
    null;

  const {
    status,
    matchState,
    participants,
    countdown,
    currentQuestion,
    selectedOptionId,
    roundReveal,
    matchEnd,
    submitAnswer,
    reconnect,
  } = useMultiplayerWs({ token, matchId });

  const { currentStreak, bestStreak, recordAnswer, resetStreak } = useStreak(matchId);

  // Track match performance statistics from round evaluations
  const [matchStats, setMatchStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
    questionsCompleted: 0,
    totalQuestions: 0,
  });

  const [remainingTimeMs, setRemainingTimeMs] = useState(15_000);

  useEffect(() => {
    if (currentQuestion) {
      setRemainingTimeMs(currentQuestion.question.timeLimitMs || 15_000);
    }
  }, [currentQuestion?.question.id]);

  // Track each evaluated question index so each round answer is only counted once
  const lastEvaluatedQuestionIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (matchState === "ROUND_REVEAL" && roundReveal && currentQuestion) {
      if (lastEvaluatedQuestionIndexRef.current !== currentQuestion.questionIndex) {
        lastEvaluatedQuestionIndexRef.current = currentQuestion.questionIndex;
        const myResult = roundReveal.results.find((r) => r.participantId === currentUserId);
        if (myResult) {
          recordAnswer(myResult.isCorrect);
          setMatchStats((prev) => ({
            correctCount: prev.correctCount + (myResult.isCorrect ? 1 : 0),
            incorrectCount: prev.incorrectCount + (!myResult.isCorrect ? 1 : 0),
            questionsCompleted: prev.questionsCompleted + 1,
            totalQuestions: currentQuestion.totalQuestions,
          }));
        }
      }
    }
  }, [matchState, roundReveal, currentQuestion, currentUserId, recordAnswer]);

  // Reset evaluated question index, streak, and match stats when match restarts or lobby begins
  useEffect(() => {
    if (matchState === "STARTING" || matchState === "LOBBY") {
      lastEvaluatedQuestionIndexRef.current = null;
      resetStreak();
      setMatchStats({
        correctCount: 0,
        incorrectCount: 0,
        questionsCompleted: 0,
        totalQuestions: 0,
      });
    }
  }, [matchState, resetStreak]);

  // NOTE: Direct private 1v1 rematch (challenging the same opponent) requires backend support for
  // private challenge/invitation events (e.g., `rematch_request` / `rematch_accept`).
  // Currently, the safest and fastest production flow re-enters the active subject's matchmaking queue.
  const handleRematch = useCallback(async () => {
    if (!activeSubject) return;
    await startSearch(activeSubject);
  }, [activeSubject, startSearch]);

  const handleBackToMultiplayer = useCallback(() => {
    router.push("/study/multiplayer");
  }, [router]);

  const handleSubmitAnswer = useCallback(
    (questionId: string, optionId: string, timeTakenMs: number) => {
      submitAnswer(questionId, optionId, timeTakenMs);
    },
    [submitAnswer]
  );

  const isConnected = status === "authenticated" || status === "connected";
  const isError = status === "error" || status === "closed";

  const me = participants.find((p) => p.id === currentUserId);
  const opponent = participants.find((p) => p.id !== currentUserId);
  const myRanking = matchEnd?.rankings?.find((r) => r.participantId === currentUserId);
  const oppRanking = matchEnd?.rankings?.find((r) => r.participantId !== currentUserId);

  return (
    <div className="flex flex-col gap-4 py-2 max-w-lg mx-auto w-full min-h-[70vh] pb-32 sm:pb-36">
      {/* ── Match Header: Identity & Status ── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          1v1 Speed Match
        </span>
        <div className="flex items-center gap-1.5">
          {isError ? (
            <>
              <WifiOff size={12} className="text-rose-500" />
              <button
                type="button"
                onClick={reconnect}
                className="text-[10px] font-black text-rose-500 hover:underline cursor-pointer"
              >
                RECONNECT
              </button>
            </>
          ) : isConnected ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600">LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <Loader2 size={12} className="animate-spin" />
              <span className="text-[10px] font-bold">CONNECTING</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Unified Competitive Match HUD (Replaces fragmented score, timer & status boxes) ── */}
      {participants.length > 0 && currentQuestion && matchState !== "FINISHED" && (
        <MatchHUD
          player={{
            gamerTag: me?.gamerTag || (me?.name && !me.name.includes("@") ? me.name : "You"),
            avatarUrl: me?.avatarUrl || "",
            score: me?.score ?? 0,
            streak: currentStreak,
          }}
          opponent={{
            gamerTag:
              opponent?.gamerTag ||
              (opponent?.name && !opponent.name.includes("@") ? opponent.name : "Ghost Scholar"),
            avatarUrl: opponent?.avatarUrl || "",
            score: opponent?.score ?? 0,
            streak: 0,
            status:
              roundReveal || (opponent as any)?.status === "LOCKED_IN"
                ? "LOCKED_IN"
                : "THINKING",
          }}
          currentRound={(currentQuestion?.questionIndex ?? 0) + 1}
          totalRounds={currentQuestion?.totalQuestions ?? 10}
          remainingTimeMs={remainingTimeMs}
          maxScoreDifferential={500}
        />
      )}

      {/* ── State Views ── */}

      {/* 0. Matchmaking Lobby View (active when player clicks REMATCH from results) */}
      {isSearching && activeSubject && matchState === "FINISHED" ? (
        <MatchmakingLobby
          subject={activeSubject}
          waitingSince={queueStatus?.waitingSince}
          onCancel={cancelSearch}
          isCancelling={isCancellingRematch}
        />
      ) : (
        <>
          {/* 1. Pre-Game Matchup & Countdown */}
          {(!matchState || matchState === "LOBBY" || matchState === "STARTING") && !matchEnd && (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              {countdown !== null ? (
                <div className="w-full max-w-sm flex flex-col items-center gap-5 p-6 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-surface-muted px-3 py-1 border border-border/40 rounded-full">
                    Match Found
                  </span>

                  {/* Player vs Opponent Face-Off */}
                  <div className="w-full grid grid-cols-5 items-center gap-2">
                    {/* You */}
                    <div className="col-span-2 flex flex-col items-center gap-1.5 text-center min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center text-base font-black text-text-primary shadow-[0_2px_0_rgba(20,24,39,0.9)]">
                          {(me?.name || "Y").trim().charAt(0).toUpperCase()}
                        </div>
                        <span
                          title="Connected"
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface bg-emerald-500"
                        />
                      </div>
                      <span className="text-xs font-black text-text-primary truncate max-w-full">
                        {me?.name || "You"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black uppercase text-text-secondary px-1.5 py-0.2 bg-primary/20 rounded">
                          YOU
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Ready
                        </span>
                      </div>
                    </div>

                    {/* VS Emblem */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted border-[1.5px] border-border flex items-center justify-center font-black text-xs text-text-secondary">
                        VS
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="col-span-2 flex flex-col items-center gap-1.5 text-center min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-surface border-[2px] border-border flex items-center justify-center text-base font-black text-text-secondary shadow-[0_2px_0_rgba(20,24,39,0.9)]">
                          {(opponent?.name || "O").trim().charAt(0).toUpperCase()}
                        </div>
                        <span
                          title={opponent?.isConnected ? "Opponent connected" : "Opponent disconnected"}
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                            opponent?.isConnected ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-black text-text-primary truncate max-w-full">
                        {opponent?.name || "Opponent"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black uppercase text-text-secondary px-1.5 py-0.2 bg-surface-muted rounded">
                          OPPONENT
                        </span>
                        <span className={`text-[10px] font-bold ${opponent?.isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          {opponent?.isConnected ? "Ready" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Number */}
                  <div className="flex flex-col items-center gap-1 pt-3 border-t border-border/10 w-full">
                    <span className="text-5xl font-black text-text-primary tabular-nums">
                      {countdown}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                      Get ready to answer
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 size={32} className="text-text-secondary animate-spin" />
                  <span className="text-xs font-black text-text-secondary tracking-wide">
                    {status === "connecting" ? "CONNECTING TO MATCH…" : "WAITING FOR OPPONENT TO CONNECT…"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. Active Question & In-Place Answer Feedback */}
          {(matchState === "QUESTION_ACTIVE" || matchState === "ROUND_REVEAL") && currentQuestion && (
            <div className="flex flex-col gap-3 w-full">
              {/* Clutch State Alert Bar (Questions 8, 9, 10 or Endgame states) */}
              <ClutchStateBanner
                state={{
                  currentQuestion: currentQuestion.questionIndex + 1,
                  totalQuestions: currentQuestion.totalQuestions,
                  playerScore: me?.score ?? 0,
                  opponentScore: opponent?.score ?? 0,
                }}
              />
              <LiveQuestion
                questionData={currentQuestion}
                selectedOptionId={selectedOptionId}
                onSelect={handleSubmitAnswer}
                roundReveal={matchState === "ROUND_REVEAL" ? roundReveal : null}
                currentUserId={currentUserId ?? ""}
                isFinalQuestion={
                  currentQuestion.questionIndex === currentQuestion.totalQuestions - 1
                }
                hideTimer={true}
                onTimerTick={setRemainingTimeMs}
              />
            </div>
          )}

          {/* 3. Round Evaluation Drawer (WCAG AAA High-Contrast & Micro-Learning) */}
          {roundReveal && (
            <RoundEvaluationDrawer
              isOpen={matchState === "ROUND_REVEAL"}
              isCorrect={
                roundReveal.results.find((r) => r.participantId === currentUserId)?.isCorrect ?? false
              }
              selectedOptionId={selectedOptionId ?? ""}
              correctOptionId={roundReveal.correctOptionId}
              scoreEarned={{
                base: 100,
                speedBonus:
                  roundReveal.results.find((r) => r.participantId === currentUserId)?.speedBonus ?? 0,
                streakBonus:
                  roundReveal.results.find((r) => r.participantId === currentUserId)?.streakBonus ?? 0,
                total:
                  roundReveal.results.find((r) => r.participantId === currentUserId)?.pointsEarned ?? 0,
              }}
              explanationText={getAcademicConceptExplanation(
                currentQuestion?.question.text,
                currentQuestion?.question.explanation,
                (roundReveal as any)?.explanation
              )}
              onBookmarkConcept={() => {
                toast.success("Concept saved to Revision Deck!");
              }}
              onNextQuestionReady={() => {
                // Auto-advance sequencing callback
              }}
            />
          )}

          {/* 4. Match Settlement Summary (PostMatchSummary with Three Pillars & Rematch Handshake) */}
          {matchState === "FINISHED" && matchEnd && (
            <PostMatchSummary
              data={{
                matchId,
                result:
                  (myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0)
                    ? "VICTORY"
                    : (myRanking?.score ?? me?.score ?? 0) < (oppRanking?.score ?? opponent?.score ?? 0)
                    ? "DEFEAT"
                    : "DRAW",
                player: {
                  gamerTag: me?.gamerTag || (me?.name && !me.name.includes("@") ? me.name : "You"),
                  avatarUrl: me?.avatarUrl || "",
                  finalScore: myRanking?.score ?? me?.score ?? 0,
                  eloDelta:
                    (myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0)
                      ? 16
                      : (myRanking?.score ?? me?.score ?? 0) < (oppRanking?.score ?? opponent?.score ?? 0)
                      ? -12
                      : 0,
                  newElo:
                    1100 +
                    ((myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0)
                      ? 16
                      : (myRanking?.score ?? me?.score ?? 0) < (oppRanking?.score ?? opponent?.score ?? 0)
                      ? -12
                      : 0),
                  schoolCode: "TEMASHS",
                },
                opponent: {
                  id: opponent?.id || "opp-1",
                  gamerTag:
                    opponent?.gamerTag ||
                    (opponent?.name && !opponent.name.includes("@") ? opponent.name : "Opponent"),
                  avatarUrl: opponent?.avatarUrl || "",
                  finalScore: oppRanking?.score ?? opponent?.score ?? 0,
                },
                subject: {
                  name: activeSubject?.name || "Elective Mathematics",
                  accuracyPercentage:
                    matchStats.totalQuestions > 0
                      ? Math.round((matchStats.correctCount / matchStats.totalQuestions) * 100)
                      : 80,
                  deltaAccuracy: 4,
                },
                schoolTurfContribution:
                  (myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0) ? 35 : 10,
                missedQuestions: currentQuestion
                  ? [
                      {
                        id: currentQuestion.question.id,
                        questionText: currentQuestion.question.text,
                        selectedAnswer:
                          currentQuestion.question.options.find((o) => o.id === selectedOptionId)?.text ||
                          "Selected Option",
                        correctAnswer:
                          currentQuestion.question.options.find(
                            (o) => o.id === (roundReveal?.correctOptionId || currentQuestion.question.options[0]?.id)
                          )?.text || "Correct Option",
                        conceptExplanation: getAcademicConceptExplanation(
                          currentQuestion.question.text,
                          currentQuestion.question.explanation,
                          (roundReveal as any)?.explanation
                        ),
                      },
                    ]
                  : [],
              }}
              onLaunchRematch={(newId) => router.push(`/study/multiplayer/${newId}`)}
              onFindNewOpponent={handleBackToMultiplayer}
              onEmitRematchRequest={handleRematch}
            />
          )}

          {/* 5. Reconnecting mid-question — waiting for question data */}
          {(matchState === "QUESTION_ACTIVE" || matchState === "ROUND_REVEAL") && !currentQuestion && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={32} className="text-text-secondary animate-spin" />
              <span className="text-xs font-black text-text-secondary tracking-wide">
                SYNCING MATCH DATA…
              </span>
            </div>
          )}

          {/* 6. Match Abandoned */}
          {matchState === "ABANDONED" && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4 text-center">
              <WifiOff size={32} className="text-text-secondary" />
              <span className="text-sm font-black text-text-primary">
                Match Abandoned
              </span>
              <span className="text-xs text-text-secondary">
                Your opponent disconnected. The match has ended.
              </span>
              <button
                type="button"
                onClick={handleBackToMultiplayer}
                className="mt-2 px-6 py-2.5 rounded-xl bg-primary border-[2px] border-border text-sm font-black text-text-primary shadow-[0_3px_0_rgba(20,24,39,0.9)] hover:translate-y-[1px] hover:shadow-[0_2px_0_rgba(20,24,39,0.9)] transition-all cursor-pointer"
              >
                Back to Arena
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
