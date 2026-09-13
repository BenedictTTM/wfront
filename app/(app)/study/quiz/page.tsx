"use client";

import React, { useState, useEffect, Suspense } from "react";
import { BookOpen, X, Loader2, Sparkles, ChevronLeft, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useEnergy } from "@/features/gamification/hooks";
import { generateIdempotencyKey } from "@/lib/idempotency";
import {
  useCreateQuizAttempt,
  useFlashcards,
  useQuizAttempt,
  useSubmitQuizAnswer,
  useSubmitQuizAttempt,
} from "@/features/quiz/hooks";
import { abandonQuizAttempt } from "@/features/quiz/api";
import {
  SubjectTopicSelector,
  QuestionCard,
  OptionSelector,
  QuizResultsScreen,
  EnergyWarningModal,
  FlashcardReview,
} from "@/features/quiz/components";
import { AttemptMode, QuizAttempt, SubmitAttemptResponseDto } from "@/features/quiz/types";


// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-xs font-black text-text-primary">{label}</span>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function PracticeQuizContent() {
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
  const [inFlashcardReview, setInFlashcardReview] = useState<boolean>(initialMode !== "quiz" && !initialLevelId);

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

  // Rehydrate state from fetched attempt (resilient to browser refresh)
  useEffect(() => {
    if (fetchedAttempt) {
      setCurrentAttempt(fetchedAttempt);
      if (fetchedAttempt.answers && fetchedAttempt.answers.length > 0) {
        setAnswersMap((prev) => {
          const updated = { ...prev };
          fetchedAttempt.answers?.forEach((a) => {
            if (a.questionId) {
              updated[a.questionId] = {
                selectedOptionId: a.selectedOptionId ?? undefined,
                submittedText: a.submittedText ?? undefined,
              };
            }
          });
          return updated;
        });

        setFeedbackMap((prev) => {
          const updated = { ...prev };
          fetchedAttempt.answers?.forEach((a) => {
            if (a.questionId && (a.selectedOptionId || a.submittedText)) {
              updated[a.questionId] = {
                isCorrect: a.isCorrect,
                correctOption: a.correctOption,
                explanation: a.explanation,
              };
            }
          });
          return updated;
        });
      }

      // If attempt is already submitted, fetch scored outcome idempotently
      if (fetchedAttempt.status === "SUBMITTED" && !submissionResults && !submitQuizMutation.isPending) {
        submitQuizMutation.mutateAsync(fetchedAttempt.id).then((res) => {
          setSubmissionResults(res);
        }).catch(console.error);
      }
    }
  }, [fetchedAttempt]);

  const handleStartQuiz = async (params: {
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

      // Update URL with attemptId so page refresh keeps active session
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("attemptId", newAttempt.id);
        window.history.replaceState({}, "", url.toString());
      }

      toast.success(mode === "JOURNEY" ? "Challenge session ready!" : "Practice quiz started!");
    } catch (err: any) {
      const message = err?.message || "Failed to start quiz attempt";
      if (message.toLowerCase().includes("energy")) {
        setShowEnergyWarning(true);
      } else {
        toast.error(message);
      }
    }
  };

  const saveAnswerToBackend = async (
    questionId: string,
    selectedOptionId?: string,
    submittedText?: string,
    rethrowError = false,
  ) => {
    if (!activeAttemptId || (!selectedOptionId && !submittedText?.trim())) return null;
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
    } catch (err: any) {
      console.error("Failed to save answer:", err);
      if (rethrowError) throw err;
      return null;
    }
  };

  const handleSelectOption = async (optionKey: string) => {
    if (!currentAttempt?.questions) return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;

    // Prevent changing answer if already answered and feedback revealed
    if (feedbackMap[q.id]) return;

    const updated = { ...answersMap[q.id], selectedOptionId: optionKey };
    setAnswersMap((prev) => ({ ...prev, [q.id]: updated }));

    // Immediate authoritative pedagogical feedback
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
    } catch (err: any) {
      toast.error("Network issue saving answer. Please retry.");
    }
  };

  const handleChangeText = (text: string) => {
    if (!currentAttempt?.questions) return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;
    if (feedbackMap[q.id]) return;
    setAnswersMap((prev) => ({ ...prev, [q.id]: { ...prev[q.id], submittedText: text } }));
  };

  const handleNextQuestion = () => {
    if (!currentAttempt?.questions) return;
    if (currentQuestionIndex + 1 < currentAttempt.questions.length) {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentAttempt?.questions || currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((p) => p - 1);
  };

  const handleFinishQuiz = async () => {
    if (!currentAttempt || !activeAttemptId) return;
    setIsSubmittingFinal(true);
    try {
      const results = await submitQuizMutation.mutateAsync(activeAttemptId);
      setSubmissionResults(results);
      toast.success("Quiz submitted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit quiz");
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleResetQuiz = () => {
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
  };

  const handleExitSession = async () => {
    if (!activeAttemptId) {
      router.push("/study");
      return;
    }
    const confirmExit = window.confirm("Are you sure you want to exit? Your attempt will be abandoned.");
    if (!confirmExit) return;

    try {
      await abandonQuizAttempt(activeAttemptId);
      toast.info("Session exited");
    } catch (e) {
      // ignore
    }
    router.push("/study");
  };

  const handleContinueNextLevel = (nextLevelId: string) => {
    handleResetQuiz();
    const subjectParam = currentAttempt?.subjectId || initialSubjectId;
    router.push(`/study/quiz?levelId=${nextLevelId}&subjectId=${subjectParam}&mode=quiz`);
  };

  // Launch Journey challenge or practice quiz when params are present in URL
  useEffect(() => {
    if (initialLevelId && !activeAttemptId && !currentAttempt && !createAttemptMutation.isPending) {
      handleStartQuiz({
        subjectId: initialSubjectId,
        levelId: initialLevelId,
        challengeId: initialChallengeId || undefined,
        journeyId: initialJourneyId || undefined,
        subtopicId: initialSubtopicId || undefined,
        mode: "JOURNEY",
        overrideFlashcardReview: false,
      });
    } else if (
      initialSubjectId &&
      !initialLevelId &&
      !activeAttemptId &&
      !currentAttempt &&
      !createAttemptMutation.isPending
    ) {
      handleStartQuiz({
        subjectId: initialSubjectId,
        topicId: initialTopicId || undefined,
        subtopicId: initialSubtopicId || undefined,
        mode: "PRACTICE",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLevelId, initialSubjectId, initialTopicId, initialSubtopicId]);

  // ── Results Screen ───────────────────────────────────────────────────────────
  if (submissionResults) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6">
        <QuizResultsScreen
          results={submissionResults}
          onReset={handleResetQuiz}
          onContinueNextLevel={handleContinueNextLevel}
        />
      </div>
    );
  }

  // ── Selector (if no active session) ───────────────────────────────────────────
  if (!activeAttemptId && !currentAttempt) {
    return (
      <>
        <SubjectTopicSelector
          onStartQuiz={(subjectId, topicId, mode) =>
            handleStartQuiz({ subjectId, topicId, mode })
          }
          isStarting={createAttemptMutation.isPending}
          userEnergy={userEnergy}
        />
        <EnergyWarningModal
          isOpen={showEnergyWarning}
          onClose={() => setShowEnergyWarning(false)}
          currentEnergy={userEnergy}
        />
      </>
    );
  }

  // ── Loading Quiz Attempt ───────────────────────────────────────────────────────
  if (loadingAttempt || createAttemptMutation.isPending) {
    return <LoadingCard label="Preparing challenge questions…" />;
  }

  // ── Loading Flashcards ───────────────────────────────────────────────────────
  if (inFlashcardReview && activeAttemptId && loadingFlashcards) {
    return <LoadingCard label="Preparing your quick review…" />;
  }

  // ── Flashcard Review Screen ──────────────────────────────────────────────────
  const flashcards = flashcardsData?.flashcards || [];
  if (inFlashcardReview && activeAttemptId && flashcards.length > 0) {
    return (
      <FlashcardReview
        flashcards={flashcards}
        onStartQuiz={() => setInFlashcardReview(false)}
        onSkip={() => setInFlashcardReview(false)}
      />
    );
  }

  // ── Error / empty state ───────────────────────────────────────────────────────
  if (attemptError || !currentAttempt || !currentAttempt.questions || currentAttempt.questions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-8 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
          <X size={24} className="text-text-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-black text-text-primary">Unable to Load Challenge</h4>
          <p className="text-xs text-text-secondary max-w-sm">
            {attemptError instanceof Error
              ? attemptError.message
              : "No questions currently configured for this challenge level."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetQuiz}
            className="px-5 py-2.5 bg-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 cursor-pointer"
          >
            TRY ANOTHER TOPIC
          </button>
          <Link
            href="/study"
            className="px-4 py-2.5 border-[2px] border-border rounded-xl text-xs font-black hover:bg-surface-muted transition-colors"
          >
            RETURN TO MAP
          </Link>
        </div>
      </div>
    );
  }

  // ── Active Quiz Session ───────────────────────────────────────────────────────
  const questions = currentAttempt.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const activeAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const currentFeedback = currentQuestion ? feedbackMap[currentQuestion.id] : undefined;
  const isAnswered = Boolean(activeAnswer?.selectedOptionId || activeAnswer?.submittedText?.trim());
  const isLastQuestion = currentQuestionIndex + 1 === questions.length;
  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isJourneyMode = currentAttempt.mode === "JOURNEY";

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[2px] border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary border-[2px] border-border flex items-center justify-center">
            <BookOpen size={16} className="text-text-primary" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-text-primary leading-tight">
              {isJourneyMode ? "Journey Challenge" : "WASSCE Practice Session"}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
              {isJourneyMode ? "Level Progression" : "Skill Drill"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExitSession}
          className="p-1.5 border-[2px] border-border rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label="Exit session"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-3 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-bold text-text-secondary">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progressPct)}% Completed</span>
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      {/* Options */}
      <OptionSelector
        options={currentQuestion.options}
        questionType={currentQuestion.type}
        selectedOptionId={activeAnswer?.selectedOptionId ?? null}
        submittedText={activeAnswer?.submittedText ?? ""}
        onSelectOption={handleSelectOption}
        onChangeText={handleChangeText}
        feedback={currentFeedback}
        isFeedbackRevealed={Boolean(currentFeedback)}
      />

      {/* Immediate Pedagogical Feedback Drawer */}
      {currentFeedback && (
        <div
          className={[
            "p-4 border-[2px] rounded-xl flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200",
            currentFeedback.isCorrect
              ? "bg-emerald-500/10 border-emerald-600 text-emerald-950 dark:text-emerald-200"
              : "bg-rose-500/10 border-rose-600 text-rose-950 dark:text-rose-200",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 font-black text-xs md:text-sm">
            {currentFeedback.isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Brilliant! That is correct.</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  Not quite. {currentFeedback.correctOption ? `Correct answer is Option (${currentFeedback.correctOption}).` : ""}
                </span>
              </>
            )}
          </div>

          {currentFeedback.explanation && (
            <div className="text-xs font-medium text-text-secondary bg-surface/90 p-3 rounded-lg border border-border mt-1">
              <span className="font-black text-text-primary block text-[10px] uppercase tracking-wider mb-0.5">
                Explanation & Key Insight
              </span>
              {currentFeedback.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t-[2px] border-border">
        <button
          type="button"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSubmittingFinal}
          className="flex items-center gap-1.5 px-4 py-2.5 border-[2px] border-border rounded-xl font-black text-xs hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
          PREVIOUS
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={!isAnswered || isSubmittingFinal}
            className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>NEXT QUESTION</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishQuiz}
            disabled={!isAnswered || isSubmittingFinal}
            className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 cursor-pointer transition-all"
          >
            {isSubmittingFinal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>EVALUATING & UNLOCKING…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>COMPLETE CHALLENGE</span>
              </>
            )}
          </button>
        )}
      </div>

      <EnergyWarningModal
        isOpen={showEnergyWarning}
        onClose={() => setShowEnergyWarning(false)}
        currentEnergy={userEnergy}
      />
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function PracticeQuizPage() {
  return (
    <Suspense fallback={<LoadingCard label="Loading challenge session…" />}>
      <PracticeQuizContent />
    </Suspense>
  );
}
