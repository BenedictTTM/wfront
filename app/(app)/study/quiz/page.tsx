"use client";

import React, { useState, useEffect, Suspense } from "react";
import { BookOpen, X, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useEnergy } from "@/features/gamification/hooks";
import { generateIdempotencyKey } from "@/lib/idempotency";
import {
  useCreateQuizAttempt,
  useQuizAttempt,
  useSubmitQuizAnswer,
  useSubmitQuizAttempt,
} from "@/features/quiz/hooks";
import {
  SubjectTopicSelector,
  QuestionCard,
  OptionSelector,
  QuizResultsScreen,
  EnergyWarningModal,
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
  const queryAttemptId = searchParams.get("attemptId") || "";

  const { data: energyData } = useEnergy();
  const userEnergy = energyData?.currentEnergy ?? 30;

  const [activeAttemptId, setActiveAttemptId] = useState<string>(queryAttemptId);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<
    Record<string, { selectedOptionId?: string; submittedText?: string }>
  >({});
  const [submissionResults, setSubmissionResults] = useState<SubmitAttemptResponseDto | null>(null);
  const [showEnergyWarning, setShowEnergyWarning] = useState<boolean>(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);

  const createAttemptMutation = useCreateQuizAttempt();
  const submitAnswerMutation = useSubmitQuizAnswer();
  const submitQuizMutation = useSubmitQuizAttempt();

  const {
    data: fetchedAttempt,
    isLoading: loadingAttempt,
    error: attemptError,
  } = useQuizAttempt(activeAttemptId);

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
      }
    }
  }, [fetchedAttempt]);

  const handleStartQuiz = async (
    subjectId: string,
    topicId?: string,
    mode: AttemptMode = "PRACTICE",
  ) => {
    if (userEnergy < 3) {
      setShowEnergyWarning(true);
      return;
    }
    try {
      const newAttempt = await createAttemptMutation.mutateAsync({ mode, subjectId, topicId });
      setCurrentAttempt(newAttempt);
      setActiveAttemptId(newAttempt.id);
      setCurrentQuestionIndex(0);
      setAnswersMap({});
      setSubmissionResults(null);
      toast.success("Quiz attempt started!");
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
    if (!activeAttemptId || (!selectedOptionId && !submittedText?.trim())) return;
    const key = generateIdempotencyKey();
    try {
      await submitAnswerMutation.mutateAsync({
        attemptId: activeAttemptId,
        answer: {
          questionId,
          selectedOptionId: selectedOptionId || undefined,
          submittedText: submittedText?.trim() || undefined,
        },
        idempotencyKey: key,
      });
    } catch (err: any) {
      console.error("Failed to save answer:", err);
      if (rethrowError) throw err;
    }
  };

  const handleSelectOption = (optionKey: string) => {
    if (!currentAttempt?.questions) return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;
    const updated = { ...answersMap[q.id], selectedOptionId: optionKey };
    setAnswersMap((prev) => ({ ...prev, [q.id]: updated }));
    saveAnswerToBackend(q.id, optionKey, updated.submittedText);
  };

  const handleChangeText = (text: string) => {
    if (!currentAttempt?.questions) return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;
    setAnswersMap((prev) => ({ ...prev, [q.id]: { ...prev[q.id], submittedText: text } }));
  };

  const saveCurrentAnswer = async (rethrow = false) => {
    if (!currentAttempt?.questions) return;
    const q = currentAttempt.questions[currentQuestionIndex];
    if (!q) return;
    const ans = answersMap[q.id];
    if (ans?.selectedOptionId || ans?.submittedText?.trim()) {
      await saveAnswerToBackend(q.id, ans.selectedOptionId, ans.submittedText, rethrow);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentAttempt?.questions) return;
    await saveCurrentAnswer();
    if (currentQuestionIndex + 1 < currentAttempt.questions.length) {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handlePreviousQuestion = async () => {
    if (!currentAttempt?.questions || currentQuestionIndex === 0) return;
    await saveCurrentAnswer();
    setCurrentQuestionIndex((p) => p - 1);
  };

  const handleFinishQuiz = async () => {
    if (!currentAttempt || !activeAttemptId) return;
    setIsSubmittingFinal(true);
    try {
      await saveCurrentAnswer(true);
      await Promise.all(
        Object.entries(answersMap).map(([qId, ans]) => {
          if (ans.selectedOptionId || ans.submittedText?.trim()) {
            return saveAnswerToBackend(qId, ans.selectedOptionId, ans.submittedText, true);
          }
          return Promise.resolve();
        }),
      );
      const results = await submitQuizMutation.mutateAsync(activeAttemptId);
      setSubmissionResults(results);
      toast.success("Quiz submitted!");
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
    setSubmissionResults(null);
  };

  useEffect(() => {
    if (initialSubjectId && !activeAttemptId && !currentAttempt && !createAttemptMutation.isPending) {
      handleStartQuiz(initialSubjectId, initialTopicId || undefined, "PRACTICE");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSubjectId, initialTopicId]);

  // ── Results ──────────────────────────────────────────────────────────────────
  if (submissionResults) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6">
        <QuizResultsScreen results={submissionResults} onReset={handleResetQuiz} />
      </div>
    );
  }

  // ── Selector ─────────────────────────────────────────────────────────────────
  if (!activeAttemptId && !currentAttempt) {
    return (
      <>
        <SubjectTopicSelector
          onStartQuiz={handleStartQuiz}
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

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loadingAttempt || createAttemptMutation.isPending) {
    return <LoadingCard label="Generating practice quiz questions…" />;
  }

  // ── Error / empty ─────────────────────────────────────────────────────────────
  if (attemptError || !currentAttempt || !currentAttempt.questions || currentAttempt.questions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-8 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
          <X size={24} className="text-text-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-black text-text-primary">No Questions Available</h4>
          <p className="text-xs text-text-secondary max-w-sm">
            {attemptError instanceof Error
              ? attemptError.message
              : "No published questions found for this subject/topic yet."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetQuiz}
          className="px-5 py-2.5 bg-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 cursor-pointer"
        >
          TRY ANOTHER SUBJECT
        </button>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────────
  const questions = currentAttempt.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const activeAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex + 1 === questions.length;
  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[2px] border-border pb-3">
        <h3 className="text-sm md:text-base font-black flex items-center gap-2 text-text-primary">
          <BookOpen size={18} className="text-primary" />
          WASSCE Practice Session
        </h3>
        <Link
          href="/study"
          className="p-1.5 border-[2px] border-border rounded-lg hover:bg-surface-muted transition-colors"
          aria-label="Exit quiz"
        >
          <X size={16} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-3 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-text-secondary text-right">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
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
      />

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
            disabled={isSubmittingFinal}
            className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
          >
            NEXT QUESTION
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishQuiz}
            disabled={isSubmittingFinal}
            className="px-5 py-2.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isSubmittingFinal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SUBMITTING…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>FINISH & SUBMIT</span>
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
    <Suspense fallback={<LoadingCard label="Loading quiz centre…" />}>
      <PracticeQuizContent />
    </Suspense>
  );
}
