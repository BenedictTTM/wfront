"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, WifiOff, Trophy, ArrowRight, ShieldAlert } from "lucide-react";
import { MatchHUD } from "@/features/multiplayer/components/MatchHUD";
import { LiveQuestion } from "@/features/multiplayer/components/LiveQuestion";
import { RoundEvaluationDrawer } from "@/features/multiplayer/components/RoundEvaluationDrawer";
import { ClutchStateBanner } from "@/features/multiplayer/components/ClutchStateBanner";
import { PostMatchSummary } from "@/features/multiplayer/components/PostMatchSummary";
import { MatchmakingLobby } from "@/features/multiplayer/components/MatchmakingLobby";
import { type CombatantProfile } from "@/features/multiplayer/components/VersusMatchTransition";
import { PreMatchFlashcardCountdown } from "@/features/multiplayer/components/PreMatchFlashcardCountdown";
import {
  useMatchmaking,
  useMatchResult,
  useMultiplayerToken,
  useStreak,
  useMultiplayer,
} from "@/features/multiplayer/hooks";
import type { QuestionFeedbackItem } from "@/features/multiplayer/utils/post-match";
import { useQueryClient } from "@tanstack/react-query";
import { useSubjects } from "@/features/curriculum/hooks";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/hooks";
import { safeStorage } from "@/lib/storage";
import { type CustomProfileState } from "@/features/auth/constants";

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

  const authUser = useCurrentUser();
  const activeUserId = authUser?.id || currentUserId || "guest";
  const storageKey = `wassce_student_profile_${activeUserId}`;
  const savedProfile = safeStorage.getItem<CustomProfileState | null>(storageKey, null);

  const { data: subjects } = useSubjects();
  const { data: matchResult } = useMatchResult(matchId);

  // Matchmaking hook scoped to find another match (excluding current completed match)
  const {
    isSearching,
    queueStatus,
    startSearch,
    cancelSearch,
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
    flashcards: matchFlashcards,
    currentQuestion,
    selectedOptionId,
    roundReveal,
    matchEnd,
    disconnectGrace,
    abandonData,
    submitAnswer,
    reconnect,
  } = useMultiplayer();

  // Toast feedback when disconnect grace starts or resolves
  const prevGraceRef = useRef<boolean>(false);
  useEffect(() => {
    if (disconnectGrace && !prevGraceRef.current) {
      prevGraceRef.current = true;
      if (disconnectGrace.disconnectedUserId !== currentUserId) {
        toast.warning("Opponent disconnected! 30-second forfeit timer initiated.", {
          duration: 4000,
        });
      } else {
        toast.error("You disconnected! Reconnect before the timer expires to avoid forfeit.", {
          duration: 5000,
        });
      }
    } else if (!disconnectGrace && prevGraceRef.current) {
      prevGraceRef.current = false;
      if (matchState !== "ABANDONED" && matchState !== "FINISHED") {
        toast.success("Player reconnected! Match continuing.", {
          duration: 3000,
        });
      }
    }
  }, [disconnectGrace, currentUserId, matchState]);

  const { currentStreak, recordAnswer, resetStreak } = useStreak(matchId);

  // 10-Second Pre-Match Flashcard Warm-Up Drill:
  // Active while countdown is ticking, or room is in STARTING state, or waiting for Question 1 before match starts
  const isPreMatch =
    !matchEnd &&
    matchState !== "FINISHED" &&
    matchState !== "ABANDONED" &&
    ((countdown !== null && countdown > 0) ||
      (matchState === "STARTING" && !currentQuestion));

  // Track match performance statistics from round evaluations
  const [matchStats, setMatchStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
    questionsCompleted: 0,
    totalQuestions: 0,
  });

  // Accumulate feedback and answers for every question throughout the match
  const [matchQuestionsHistory, setMatchQuestionsHistory] = useState<QuestionFeedbackItem[]>([]);

  const [remainingTimeMs, setRemainingTimeMs] = useState(15_000);

  useEffect(() => {
    if (currentQuestion) {
      setRemainingTimeMs(currentQuestion.question.timeLimitMs || 15_000);
    }
  }, [currentQuestion]);

  // Track each evaluated question index so each round answer is only counted once
  const lastEvaluatedQuestionIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (matchState === "ROUND_REVEAL" && roundReveal && currentQuestion) {
      if (lastEvaluatedQuestionIndexRef.current !== currentQuestion.questionIndex) {
        lastEvaluatedQuestionIndexRef.current = currentQuestion.questionIndex;
        const myResult = roundReveal.results.find((r) => r.participantId === currentUserId);
        const isAnswerCorrect = myResult?.isCorrect ?? false;

        if (myResult) {
          recordAnswer(myResult.isCorrect);
          setMatchStats((prev) => ({
            correctCount: prev.correctCount + (myResult.isCorrect ? 1 : 0),
            incorrectCount: prev.incorrectCount + (!myResult.isCorrect ? 1 : 0),
            questionsCompleted: prev.questionsCompleted + 1,
            totalQuestions: currentQuestion.totalQuestions,
          }));
        }

        // Record full question feedback item for post-match review
        const mySelectedOption = currentQuestion.question.options.find(
          (o) => o.id === selectedOptionId
        );
        const correctOption = currentQuestion.question.options.find(
          (o) => o.id === roundReveal.correctOptionId
        );
        const conceptExplanation = getAcademicConceptExplanation(
          currentQuestion.question.text,
          currentQuestion.question.explanation,
          roundReveal.explanation
        );

        const feedbackItem: QuestionFeedbackItem = {
          id: currentQuestion.question.id,
          questionIndex: currentQuestion.questionIndex,
          questionText: currentQuestion.question.text,
          selectedAnswer: mySelectedOption?.text || "No selection submitted",
          correctAnswer: correctOption?.text || "Correct option",
          isCorrect: isAnswerCorrect,
          conceptExplanation,
        };

        setMatchQuestionsHistory((prev) => {
          const exists = prev.some((p) => p.questionIndex === currentQuestion.questionIndex);
          return exists ? prev : [...prev, feedbackItem];
        });

        // Automatically save wrong question to student's mistake database storage
        if (!isAnswerCorrect) {
          try {
            const mistakesKey = `wassce_mistakes_${activeUserId}`;
            const existingMistakes = safeStorage.getItem<Array<{ id?: string; [key: string]: unknown }>>(mistakesKey, []);
            if (!existingMistakes.some((m) => m.id === currentQuestion.question.id)) {
              safeStorage.setItem(mistakesKey, [
                {
                  id: currentQuestion.question.id,
                  questionText: currentQuestion.question.text,
                  selectedAnswer: mySelectedOption?.text || "No selection submitted",
                  correctAnswer: correctOption?.text || "Correct option",
                  conceptExplanation,
                  subjectId: activeSubject?.id || null,
                  timestamp: new Date().toISOString(),
                },
                ...existingMistakes,
              ]);
            }
          } catch (storageErr) {
            console.warn("[Multiplayer] Failed to store mistake in local storage:", storageErr);
          }
        }
      }
    }
  }, [matchState, roundReveal, currentQuestion, currentUserId, recordAnswer, selectedOptionId, activeUserId, activeSubject]);

  // Reset evaluated question index, streak, match stats, and round history when match restarts
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
      setMatchQuestionsHistory([]);
    }
  }, [matchState, resetStreak]);

  // NOTE: Direct private 1v1 rematch (challenging the same opponent) requires backend support for
  // private challenge/invitation events (e.g., `rematch_request` / `rematch_accept`).
  // Currently, the safest and fastest production flow re-enters the active subject's matchmaking queue.
  const handleRematch = useCallback(async () => {
    if (!activeSubject) return;
    await startSearch(activeSubject);
  }, [activeSubject, startSearch]);

  const queryClient = useQueryClient();

  const handleBackToMultiplayer = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
    router.push("/study/multiplayer");
  }, [queryClient, router]);

  const handleSubmitAnswer = useCallback(
    (questionId: string, optionId: string, timeTakenMs: number) => {
      submitAnswer(questionId, optionId, timeTakenMs);
    },
    [submitAnswer]
  );

  const handleSaveToRevisionDeck = useCallback(
    (questionId?: string) => {
      try {
        const target = questionId
          ? matchQuestionsHistory.find((q) => q.id === questionId)
          : currentQuestion
          ? {
              id: currentQuestion.question.id,
              questionText: currentQuestion.question.text,
              selectedAnswer:
                currentQuestion.question.options.find((o) => o.id === selectedOptionId)?.text || "",
              correctAnswer:
                currentQuestion.question.options.find(
                  (o) => o.id === (roundReveal?.correctOptionId || currentQuestion.question.options[0]?.id)
                )?.text || "",
              conceptExplanation: getAcademicConceptExplanation(
                currentQuestion.question.text,
                currentQuestion.question.explanation,
                roundReveal?.explanation
              ),
            }
          : null;

        if (target) {
          const deckKey = `wassce_revision_deck_${activeUserId}`;
          const existingDeck = safeStorage.getItem<Array<{ id?: string; [key: string]: unknown }>>(deckKey, []);
          if (!existingDeck.some((item) => item.id === target.id)) {
            safeStorage.setItem(deckKey, [
              {
                ...target,
                subjectId: activeSubject?.id || null,
                savedAt: new Date().toISOString(),
              },
              ...existingDeck,
            ]);
          }
        }
        toast.success("Concept saved to Revision Deck!");
      } catch {
        toast.error("Failed to save to Revision Deck.");
      }
    },
    [activeUserId, activeSubject, currentQuestion, matchQuestionsHistory, roundReveal, selectedOptionId]
  );

  const isConnected = status === "authenticated" || status === "connected";
  const isError = status === "error" || status === "closed";

  const me = participants.find((p) => p.id === currentUserId);
  const opponent = participants.find((p) => p.id !== currentUserId);
  const myRanking = matchEnd?.rankings?.find((r) => r.participantId === currentUserId);
  const oppRanking = matchEnd?.rankings?.find((r) => r.participantId !== currentUserId);


  // Derive genuine student credentials (from cache, user auth state, or WS participant data)
  const studentDisplayName =
    savedProfile?.name?.trim() ||
    authUser?.name?.trim() ||
    me?.gamerTag ||
    (me?.name && !me.name.includes("@") ? me.name : null) ||
    (authUser?.email ? authUser.email.split("@")[0] : null) ||
    "Student";

  const studentAvatarUrl =
    savedProfile?.avatarUrl ||
    authUser?.avatarUrl ||
    me?.avatarUrl ||
    null;

  const studentSchoolName =
    savedProfile?.school?.trim() ||
    authUser?.school?.name ||
    me?.school?.name ||
    "Independent Scholar";

  const studentSchoolShortCode =
    savedProfile?.schoolShortCode ||
    authUser?.school?.shortCode ||
    me?.school?.shortCode ||
    (studentSchoolName !== "Independent Scholar"
      ? studentSchoolName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase()
      : "IND");

  const studentCrestUrl =
    savedProfile?.schoolCrestUrl ||
    authUser?.school?.crestUrl ||
    me?.school?.crestUrl ||
    (studentSchoolName?.toLowerCase().includes("aquinas") ||
    studentSchoolShortCode === "AQUINAS" ||
    studentSchoolShortCode === "AQU"
      ? "https://res.cloudinary.com/dsriwu6yn/image/upload/v1791470415/crests/st-thomas-aquinas-senior-high-school.jpg"
      : null);

  const studentRegion =
    savedProfile?.schoolRegion ||
    authUser?.school?.region ||
    me?.school?.region ||
    null;

  const studentMotto =
    authUser?.school?.motto ||
    me?.school?.motto ||
    null;

  // Derive opponent profile dynamically from match room participants
  const oppDisplayName =
    opponent?.gamerTag ||
    (opponent?.name && !opponent.name.includes("@") ? opponent.name : null) ||
    "Opponent Scholar";

  const oppSchoolName =
    opponent?.school?.name ||
    (opponent ? "WASSCE Scholar League" : "Opponent");

  const oppSchoolShortCode =
    opponent?.school?.shortCode ||
    (oppSchoolName === "WASSCE Scholar League" ? "WSL" : "OPP");

  const oppCrestUrl = opponent?.school?.crestUrl || null;
  const oppAvatarUrl = opponent?.avatarUrl || null;
  const oppRegion = opponent?.school?.region || null;
  const oppMotto = opponent?.school?.motto || null;

  // Construct combatant profiles for the 1v1 duel matchup banner inside PreMatchFlashcardCountdown
  const player1: CombatantProfile = {
    username: studentDisplayName,
    avatarUrl: studentAvatarUrl,
    elo: 1000,
    schoolName: studentSchoolName,
    schoolShortCode: studentSchoolShortCode,
    schoolColor: "#055B38",
    schoolAccentColor: "#F4D06F",
    crestUrl: studentCrestUrl,
    motto: studentMotto,
    region: studentRegion,
  };

  const player2: CombatantProfile = {
    username: oppDisplayName,
    avatarUrl: oppAvatarUrl,
    elo: 1000,
    schoolName: oppSchoolName,
    schoolShortCode: oppSchoolShortCode,
    schoolColor: "#172554",
    schoolAccentColor: "#93C5FD",
    crestUrl: oppCrestUrl,
    motto: oppMotto,
    region: oppRegion,
  };

  return (
    <div className="flex flex-col gap-4 py-2 max-w-4xl mx-auto w-full min-h-[70vh] pb-32 sm:pb-36">
      {/* ── Match Header: Identity & Status ── */}
      <div className="flex items-center justify-between px-1 max-w-lg mx-auto w-full">
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
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border-[2px] border-border text-[10px] font-black text-text-primary shadow-[0_1.5px_0_#141827]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE MATCH</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <Loader2 size={12} className="animate-spin" />
              <span className="text-[10px] font-bold">CONNECTING</span>
            </div>
          )}
        </div>
      </div>


      {/* ── Match HUD: Score, Streak & Timing (Active during questions and round reveals) ── */}
      {participants.length > 0 && currentQuestion && (matchState === "QUESTION_ACTIVE" || matchState === "ROUND_REVEAL") && (
        <div className="max-w-lg mx-auto w-full">
          <MatchHUD
            player={{
              gamerTag: studentDisplayName,
              avatarUrl: studentAvatarUrl || "",
              score: me?.score ?? 0,
              streak: currentStreak,
            }}
            opponent={{
              gamerTag: oppDisplayName,
              avatarUrl: oppAvatarUrl || "",
              score: opponent?.score ?? 0,
              streak: 0,
              status:
                roundReveal || opponent?.status === "LOCKED_IN"
                  ? "LOCKED_IN"
                  : "THINKING",
            }}
            currentRound={(currentQuestion?.questionIndex ?? 0) + 1}
            totalRounds={currentQuestion?.totalQuestions ?? 10}
            remainingTimeMs={remainingTimeMs}
            maxScoreDifferential={500}
          />
        </div>
      )}

      {/* ── State Views ── */}

      {/* 0. Matchmaking Lobby View (active when player clicks REMATCH from results) */}
      {isSearching && activeSubject && matchState === "FINISHED" ? (
        <div className="max-w-lg mx-auto w-full">
          <MatchmakingLobby
            subject={activeSubject}
            waitingSince={queueStatus?.waitingSince}
            onCancel={cancelSearch}
            isCancelling={isCancellingRematch}
          />
        </div>
      ) : isPreMatch ? (
        /* 1. 10-Second Pre-Match Flashcard Warm-Up Drill (with 1v1 Combatant Duel Banner) */
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
          <PreMatchFlashcardCountdown
            countdown={countdown ?? 10}
            flashcards={matchFlashcards}
            subjectName={activeSubject?.name}
            player1={player1}
            player2={player2}
            stakes="+25 SCHOOL TURF PTS"
          />
        </div>
      ) : (
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">

          {/* Waiting for opponent / room ready */}
          {(!matchState || matchState === "LOBBY") && !matchEnd && !currentQuestion && countdown === null && (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 size={32} className="text-text-secondary animate-spin" />
                <span className="text-xs font-black text-text-secondary tracking-wide">
                  WAITING FOR OPPONENT TO CONNECT…
                </span>
              </div>
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
                roundReveal.explanation
              )}
              onBookmarkConcept={() => handleSaveToRevisionDeck()}
            />
          )}

          {/* 4. Match Settlement Summary (PostMatchSummary with All Question Reviews & Rematch Handshake) */}
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
                  gamerTag: studentDisplayName,
                  avatarUrl: studentAvatarUrl || "",
                  finalScore: myRanking?.score ?? me?.score ?? 0,
                  eloDelta:
                    (myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0)
                      ? 16
                      : (myRanking?.score ?? me?.score ?? 0) < (oppRanking?.score ?? opponent?.score ?? 0)
                      ? -12
                      : 0,
                  newElo:
                    1000 +
                    ((myRanking?.score ?? me?.score ?? 0) > (oppRanking?.score ?? opponent?.score ?? 0)
                      ? 16
                      : (myRanking?.score ?? me?.score ?? 0) < (oppRanking?.score ?? opponent?.score ?? 0)
                      ? -12
                      : 0),
                  schoolCode: studentSchoolShortCode,
                },
                opponent: {
                  id: opponent?.id || "opp-1",
                  gamerTag: oppDisplayName,
                  avatarUrl: oppAvatarUrl || "",
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
                missedQuestions: matchQuestionsHistory.filter((q) => q.isCorrect === false),
                allQuestions: matchQuestionsHistory,
              }}
              onLaunchRematch={(newId) => router.push(`/study/multiplayer/${newId}`)}
              onFindNewOpponent={handleBackToMultiplayer}
              onEmitRematchRequest={handleRematch}
              onBookmarkQuestion={handleSaveToRevisionDeck}
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

          {/* 6. Match Abandoned / Forfeited */}
          {matchState === "ABANDONED" && (() => {
            const isForfeitWinner =
              abandonData?.winnerId === currentUserId ||
              (abandonData?.disconnectedUserId ? abandonData.disconnectedUserId !== currentUserId : true);

            return (
              <div className="flex-1 flex flex-col items-center justify-center py-6 w-full animate-in zoom-in-95 duration-300">
                {isForfeitWinner ? (
                  <div className="bg-card border-[2.5px] border-border shadow-[0_6px_0_#141827] dark:shadow-[0_6px_0_#000] rounded-3xl p-6 sm:p-8 text-center max-w-md w-full flex flex-col items-center gap-4">
                    {/* Victory Trophy Badge */}
                    <div className="w-20 h-20 rounded-2xl bg-amber-400 border-[2.5px] border-border shadow-[0_4px_0_#141827] flex items-center justify-center mb-1 animate-bounce-short">
                      <Trophy size={40} className="text-[#141827]" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500 font-black text-[11px] uppercase tracking-wider">
                      <ShieldAlert size={12} />
                      Opponent Forfeited
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                        Victory by Forfeit!
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1.5 max-w-xs mx-auto">
                        Your opponent left the game and failed to rejoin within the 30-second forfeit window. The match has been awarded to you.
                      </p>
                    </div>

                    {/* Turf Points & Rewards Pill */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                      <div className="p-3 rounded-2xl bg-muted/60 border-[2px] border-border text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
                          Turf Reward
                        </span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          +35 PTS
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/60 border-[2px] border-border text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
                          Skill Delta
                        </span>
                        <span className="text-lg font-black text-primary">
                          +16 ELO
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                      <button
                        type="button"
                        onClick={handleBackToMultiplayer}
                        className="flex-1 px-5 py-3 rounded-xl bg-primary border-[2px] border-border text-sm font-black text-text-primary shadow-[0_3px_0_#141827] hover:translate-y-[1px] hover:shadow-[0_2px_0_#141827] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Play Next Match</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border-[2.5px] border-border shadow-[0_6px_0_#141827] dark:shadow-[0_6px_0_#000] rounded-3xl p-6 sm:p-8 text-center max-w-md w-full flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 border-[2.5px] border-red-500 shadow-[0_4px_0_#DC2626] flex items-center justify-center mb-1">
                      <WifiOff size={32} className="text-red-600 dark:text-red-400" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-500 font-black text-[11px] uppercase tracking-wider">
                      Match Forfeited
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-text-primary tracking-tight">
                        Match Forfeited
                      </h2>
                      <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
                        You were disconnected from the match for longer than the 30-second rejoin grace period.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBackToMultiplayer}
                      className="mt-2 w-full px-6 py-3 rounded-xl bg-muted border-[2px] border-border text-sm font-black text-text-primary shadow-[0_3px_0_#141827] hover:translate-y-[1px] hover:shadow-[0_2px_0_#141827] transition-all cursor-pointer"
                    >
                      Back to Arena
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
