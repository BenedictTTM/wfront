// features/quiz/use-quiz-session.ts — custom hook encapsulating the quiz attempt lifecycle

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { useEnergy } from "@/features/gamification/hooks";
import {
  useCreateQuizAttempt,
  useFlashcards,
  useQuizAttempt,
  useSubmitQuizAnswer,
  useSubmitQuizAttempt,
} from "./hooks";
import { abandonQuizAttempt } from "./api";
import type { AttemptMode, FlashcardListResponse, QuizAttempt, SubmitAttemptResponseDto } from "./types";

export interface UseQuizSessionReturn {
  currentAttempt: QuizAttempt | null;
  activeAttemptId: string;
  currentQuestionIndex: number;
  answersMap: Record<string, { selectedOptionId?: string; submittedText?: string }>;
  feedbackMap: Record<string, { isCorrect?: boolean; correctOption?: string; explanation?: string | null }>;
  submissionResults: SubmitAttemptResponseDto | null;
  showEnergyWarning: boolean;
  setShowEnergyWarning: (show: boolean) => void;
  isSubmittingFinal: boolean;
  inFlashcardReview: boolean;
  setInFlashcardReview: (inReview: boolean) => void;
  loadingAttempt: boolean;
  createAttemptPending: boolean;
  loadingFlashcards: boolean;
  flashcardsData: FlashcardListResponse | undefined;
  attemptError: Error | null;
  hasAutoStartParams: boolean;
  userEnergy: number;
  handleStartQuiz: (params: {
    subjectId: string;
    topicId?: string;
    subtopicId?: string;
    levelId?: string;
    challengeId?: string;
    journeyId?: string;
    mode?: AttemptMode;
    overrideFlashcardReview?: boolean;
  }) => Promise<void>;
  handleSelectOption: (optionKey: string) => Promise<void>;
  handleChangeText: (text: string) => void;
  handleNextQuestion: () => void;
  handlePreviousQuestion: () => void;
  handleFinishQuiz: () => Promise<void>;
  handleResetQuiz: () => void;
  handleExitSession: () => Promise<void>;
  handleContinueNextLevel: (nextLevelId: string) => void;
}

export function useQuizSession(): UseQuizSessionReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSubjectId = searchParams.get("subjectId") || "";
  const initialTopicId = searchParams.get("topicId") || "";
  const initialSubtopicId = searchParams.get("subtopicId") || "";
  const initialLevelId = searchParams.get("levelId") || "";
  const initialChallengeId = searchParams.get("challengeId") || "";
  const initialJourneyId = searchParams.get("journeyId") || "";
  const queryAttemptId = searchParams.get("attemptId") || "";
  const initialMode = searchParams.get("mode") || "";

  const { data: energyData } = useEnergy();
  const userEnergy = energyData?.current ?? 30;

  const [activeAttemptId, setActiveAttemptId] = useState<string>(queryAttemptId);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<
    Record<string, { selectedOptionId?: string; submittedText?: string }>
  >({});
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, { isCorrect?: boolean; correctOption?: string; explanation?: string | null }>
  >({});
  const [submissionResults, setSubmissionResults] = useState<SubmitAttemptResponseDto | null>(null);
  const [showEnergyWarning, setShowEnergyWarning] = useState<boolean>(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [inFlashcardReview, setInFlashcardReview] = useState<boolean>(true);

  const createAttemptMutation = useCreateQuizAttempt();
  const submitAnswerMutation = useSubmitQuizAnswer();
  const submitQuizMutation = useSubmitQuizAttempt();

  const {
    data: fetchedAttempt,
    isLoading: loadingAttempt,
    error: attemptError,
  } = useQuizAttempt(activeAttemptId);

  const {
    data: flashcardsData,
    isLoading: loadingFlashcards,
  } = useFlashcards(activeAttemptId);

  // Synchronize state from fetchedAttempt
  const [lastSyncedAttemptId, setLastSyncedAttemptId] = useState<string | null>(null);
  if (fetchedAttempt && fetchedAttempt.id !== lastSyncedAttemptId) {
    setLastSyncedAttemptId(fetchedAttempt.id);
    setCurrentAttempt(fetchedAttempt);
    if (fetchedAttempt.answers && fetchedAttempt.answers.length > 0) {
      const answers: Record<string, { selectedOptionId?: string; submittedText?: string }> = {};
      const feedback: Record<string, { isCorrect?: boolean; correctOption?: string; explanation?: string | null }> = {};

      fetchedAttempt.answers.forEach((a) => {
        if (a.questionId) {
          answers[a.questionId] = {
            selectedOptionId: a.selectedOptionId ?? undefined,
            submittedText: a.submittedText ?? undefined,
          };
          if (a.selectedOptionId || a.submittedText) {
            feedback[a.questionId] = {
              isCorrect: a.isCorrect,
              correctOption: a.correctOption,
              explanation: a.explanation,
            };
          }
        }
      });
      setAnswersMap(answers);
      setFeedbackMap(feedback);
    }
  }

  // Idempotently fetch results if already submitted
  useEffect(() => {
    if (fetchedAttempt && fetchedAttempt.status === "SUBMITTED" && !submissionResults && !submitQuizMutation.isPending) {
      submitQuizMutation.mutateAsync(fetchedAttempt.id).then((res) => {
        setSubmissionResults(res);
      }).catch(console.error);
    }
  }, [fetchedAttempt, submissionResults, submitQuizMutation]);

  const handleStartQuiz = useCallback(async (params: {
    subjectId: string;
    topicId?: string;
    subtopicId?: string;
    levelId?: string;
    challengeId?: string;
    journeyId?: string;
    mode?: AttemptMode;
    overrideFlashcardReview?: boolean;
  }) => {
    const mode = params.mode ?? (params.levelId ? "JOURNEY" : "PRACTICE");
    if (userEnergy < 3) {
      setShowEnergyWarning(true);
      return;
    }
    try {
      const newAttempt = await createAttemptMutation.mutateAsync({
        mode,
        subjectId: params.subjectId,
        topicId: params.topicId,
        subtopicId: params.subtopicId,
        levelId: params.levelId,
        challengeId: params.challengeId,
        journeyId: params.journeyId,
      });
      setCurrentAttempt(newAttempt);
      setActiveAttemptId(newAttempt.id);
      setCurrentQuestionIndex(0);
      setAnswersMap({});
      setFeedbackMap({});
      setSubmissionResults(null);
      setInFlashcardReview(params.overrideFlashcardReview ?? (initialMode !== "quiz" && !params.levelId));

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("attemptId", newAttempt.id);
        window.history.replaceState({}, "", url.toString());
      }

      toast.success(mode === "JOURNEY" ? "Challenge session ready!" : "Practice quiz started!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start quiz attempt";
      if (message.toLowerCase().includes("energy")) {
        setShowEnergyWarning(true);
      } else {
        toast.error(message);
      }
    }
  }, [userEnergy, createAttemptMutation, initialMode]);

  const saveAnswerToBackend = useCallback(async (
    questionId: string,
    selectedOptionId?: string,
    submittedText?: string,
  ) => {
    if (!activeAttemptId || (!selectedOptionId && !submittedText?.trim())) return null;
    if (currentAttempt?.status === "SUBMITTED") return null;
    const key = generateIdempotencyKey();
    try {
      const res = await submitAnswerMutation.mutateAsync({
        attemptId: activeAttemptId,
        answer: {
          questionId,
          selectedOptionId: selectedOptionId || undefined,
          submittedText: submittedText?.trim() || undefined,
        },
        idempotencyKey: key,
      });
      return res;
    } catch (err: unknown) {
      console.error("Failed to save answer:", err);
      return null;
    }
  }, [activeAttemptId, currentAttempt?.status, submitAnswerMutation]);

  const handleSelectOption = useCallback(async (optionKey: string) => {
    if (!currentAttempt?.questions || currentAttempt.status === "SUBMITTED") return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;

    if (feedbackMap[q.id]) return;

    const updated = { ...answersMap[q.id], selectedOptionId: optionKey };
    setAnswersMap((prev) => ({ ...prev, [q.id]: updated }));

    try {
      const res = await saveAnswerToBackend(q.id, optionKey, updated.submittedText);
      if (res) {
        setFeedbackMap((prev) => ({
          ...prev,
          [q.id]: {
            isCorrect: res.isCorrect,
            correctOption: res.correctOption,
            explanation: res.explanation || q.explanation,
          },
        }));
      }
    } catch {
      toast.error("Network issue saving answer. Please retry.");
    }
  }, [currentAttempt, currentQuestionIndex, feedbackMap, answersMap, saveAnswerToBackend]);

  const handleChangeText = useCallback((text: string) => {
    if (!currentAttempt?.questions || currentAttempt.status === "SUBMITTED") return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q || feedbackMap[q.id]) return;
    setAnswersMap((prev) => ({ ...prev, [q.id]: { ...prev[q.id], submittedText: text } }));
  }, [currentAttempt, currentQuestionIndex, feedbackMap]);

  const handleNextQuestion = useCallback(() => {
    if (!currentAttempt?.questions) return;
    if (currentQuestionIndex + 1 < currentAttempt.questions.length) {
      setCurrentQuestionIndex((p) => p + 1);
    }
  }, [currentAttempt, currentQuestionIndex]);

  const handlePreviousQuestion = useCallback(() => {
    if (!currentAttempt?.questions || currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((p) => p - 1);
  }, [currentAttempt, currentQuestionIndex]);

  const handleFinishQuiz = useCallback(async () => {
    if (!currentAttempt || !activeAttemptId) return;
    setIsSubmittingFinal(true);
    try {
      const results = await submitQuizMutation.mutateAsync(activeAttemptId);
      setSubmissionResults(results);
      toast.success("Quiz submitted successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setIsSubmittingFinal(false);
    }
  }, [currentAttempt, activeAttemptId, submitQuizMutation]);

  const handleResetQuiz = useCallback(() => {
    setActiveAttemptId("");
    setCurrentAttempt(null);
    setCurrentQuestionIndex(0);
    setAnswersMap({});
    setFeedbackMap({});
    setSubmissionResults(null);
    setInFlashcardReview(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("attemptId");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleExitSession = useCallback(async () => {
    if (!activeAttemptId) {
      router.push("/study");
      return;
    }
    const confirmExit = window.confirm("Are you sure you want to exit? Your attempt will be abandoned.");
    if (!confirmExit) return;

    try {
      await abandonQuizAttempt(activeAttemptId);
      toast.info("Session exited");
    } catch {
      // ignore
    }
    router.push("/study");
  }, [activeAttemptId, router]);

  const handleContinueNextLevel = useCallback((nextLevelId: string) => {
    handleResetQuiz();
    const subjectParam = currentAttempt?.subjectId || initialSubjectId;
    router.push(`/study/quiz?levelId=${nextLevelId}&subjectId=${subjectParam}&mode=quiz`);
  }, [handleResetQuiz, currentAttempt?.subjectId, initialSubjectId, router]);

  const hasAutoStartParams = Boolean(
    initialSubjectId ||
    initialLevelId ||
    initialTopicId ||
    initialSubtopicId ||
    queryAttemptId
  );

  // Auto-start logic when triggered from deep link
  useEffect(() => {
    let cancelled = false;

    if (initialLevelId && !activeAttemptId && !currentAttempt && !createAttemptMutation.isPending) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          void handleStartQuiz({
            subjectId: initialSubjectId,
            levelId: initialLevelId,
            challengeId: initialChallengeId || undefined,
            journeyId: initialJourneyId || undefined,
            subtopicId: initialSubtopicId || undefined,
            mode: "JOURNEY",
            overrideFlashcardReview: false,
          });
        }
      });
    } else if (
      initialSubjectId &&
      !initialLevelId &&
      !activeAttemptId &&
      !currentAttempt &&
      !createAttemptMutation.isPending
    ) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          void handleStartQuiz({
            subjectId: initialSubjectId,
            topicId: initialTopicId || undefined,
            subtopicId: initialSubtopicId || undefined,
            mode: "PRACTICE",
            overrideFlashcardReview: initialMode === "quiz" ? false : undefined,
          });
        }
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLevelId, initialSubjectId, initialTopicId, initialSubtopicId]);

  return {
    currentAttempt,
    activeAttemptId,
    currentQuestionIndex,
    answersMap,
    feedbackMap,
    submissionResults,
    showEnergyWarning,
    setShowEnergyWarning,
    isSubmittingFinal,
    inFlashcardReview,
    setInFlashcardReview,
    loadingAttempt,
    createAttemptPending: createAttemptMutation.isPending,
    loadingFlashcards,
    flashcardsData,
    attemptError: attemptError instanceof Error ? attemptError : null,
    hasAutoStartParams,
    userEnergy,
    handleStartQuiz,
    handleSelectOption,
    handleChangeText,
    handleNextQuestion,
    handlePreviousQuestion,
    handleFinishQuiz,
    handleResetQuiz,
    handleExitSession,
    handleContinueNextLevel,
  };
}
