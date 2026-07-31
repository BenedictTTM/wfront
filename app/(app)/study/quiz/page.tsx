"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Star, X, Loader2, Sparkles } from "lucide-react";
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

function PracticeQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params
  const initialSubjectId = searchParams.get("subjectId") || "";
  const initialTopicId = searchParams.get("topicId") || "";
  const queryAttemptId = searchParams.get("attemptId") || "";

  // Energy state from server
  const { data: energyData } = useEnergy();
  const userEnergy = energyData?.currentEnergy ?? 30;

  // Active quiz session state
  const [activeAttemptId, setActiveAttemptId] = useState<string>(queryAttemptId);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<
    Record<string, { selectedOptionId?: string; submittedText?: string }>
  >({});
  const [submissionResults, setSubmissionResults] = useState<SubmitAttemptResponseDto | null>(null);

  // Modals & UI states
  const [showEnergyWarning, setShowEnergyWarning] = useState<boolean>(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);

  // React Query mutations & queries
  const createAttemptMutation = useCreateQuizAttempt();
  const submitAnswerMutation = useSubmitQuizAnswer();
  const submitQuizMutation = useSubmitQuizAttempt();

  // Query for resuming existing attempt if activeAttemptId is set
  const { data: fetchedAttempt, isLoading: loadingAttempt, error: attemptError } = useQuizAttempt(activeAttemptId);

  // Sync fetched attempt to state when resuming or after creation
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

  // Handle start quiz
  const handleStartQuiz = async (subjectId: string, topicId?: string, mode: AttemptMode = "PRACTICE") => {
    if (userEnergy < 3) {
      setShowEnergyWarning(true);
      return;
    }

    try {
      const newAttempt = await createAttemptMutation.mutateAsync({
        mode,
        subjectId,
        topicId,
      });

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

  // Save answer to backend for a given question
  const saveAnswerToBackend = async (
    questionId: string,
    selectedOptionId?: string,
    submittedText?: string,
    rethrowError = false
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
      console.error("Failed to save answer to backend:", err);
      if (rethrowError) throw err;
    }
  };

  // Handle option selection for current question
  const handleSelectOption = (optionKey: string) => {
    if (!currentAttempt?.questions) return;
    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const updatedAnswer = {
      ...answersMap[currentQuestion.id],
      selectedOptionId: optionKey,
    };

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    saveAnswerToBackend(currentQuestion.id, optionKey, updatedAnswer.submittedText);
  };

  // Handle text change for current question
  const handleChangeText = (text: string) => {
    if (!currentAttempt?.questions) return;
    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const updatedAnswer = {
      ...answersMap[currentQuestion.id],
      submittedText: text,
    };

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));
  };

  // Save current question before navigation
  const saveCurrentQuestionAnswer = async (rethrowError = false) => {
    if (!currentAttempt?.questions) return;
    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const currentAns = answersMap[currentQuestion.id];
    if (currentAns?.selectedOptionId || currentAns?.submittedText?.trim()) {
      await saveAnswerToBackend(
        currentQuestion.id,
        currentAns.selectedOptionId,
        currentAns.submittedText,
        rethrowError
      );
    }
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (!currentAttempt?.questions) return;
    await saveCurrentQuestionAnswer();
    if (currentQuestionIndex + 1 < currentAttempt.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = async () => {
    if (!currentAttempt?.questions || currentQuestionIndex === 0) return;
    await saveCurrentQuestionAnswer();
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  // Handle final quiz submission
  const handleFinishQuiz = async () => {
    if (!currentAttempt || !activeAttemptId) return;
    setIsSubmittingFinal(true);

    try {
      // 1. Save current question answer
      await saveCurrentQuestionAnswer(true);

      // 2. Persist all recorded answers to backend
      const savePromises = Object.entries(answersMap).map(([qId, ans]) => {
        if (ans.selectedOptionId || ans.submittedText?.trim()) {
          return saveAnswerToBackend(qId, ans.selectedOptionId, ans.submittedText, true);
        }
        return Promise.resolve();
      });
      await Promise.all(savePromises);

      // 3. Submit quiz attempt
      const results = await submitQuizMutation.mutateAsync(activeAttemptId);
      setSubmissionResults(results);
      toast.success("Quiz completed and submitted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit quiz attempt");
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  // Reset quiz session
  const handleResetQuiz = () => {
    setActiveAttemptId("");
    setCurrentAttempt(null);
    setCurrentQuestionIndex(0);
    setAnswersMap({});
    setSubmissionResults(null);
  };

  // Auto-start if subjectId was provided in query parameters on mount
  useEffect(() => {
    if (initialSubjectId && !activeAttemptId && !currentAttempt && !createAttemptMutation.isPending) {
      handleStartQuiz(initialSubjectId, initialTopicId || undefined, "PRACTICE");
    }
  }, [initialSubjectId, initialTopicId]);

  // View state determination
  if (submissionResults) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-6">
        <QuizResultsScreen results={submissionResults} onReset={handleResetQuiz} />
      </div>
    );
  }

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

  if (loadingAttempt || createAttemptMutation.isPending) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-extrabold text-text-primary">
          Generating practice quiz questions...
        </span>
      </div>
    );
  }

  if (attemptError || !currentAttempt || !currentAttempt.questions || currentAttempt.questions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-8 flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
          <X size={24} />
        </div>
        <h4 className="text-base font-black text-text-primary">No Questions Available</h4>
        <p className="text-xs text-text-secondary max-w-sm">
          {attemptError instanceof Error
            ? attemptError.message
            : "No published questions found for this subject/topic scope yet."}
        </p>
        <button
          type="button"
          onClick={handleResetQuiz}
          className="px-5 py-2.5 bg-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2.5px_0_#141827] cursor-pointer"
        >
          TRY ANOTHER SUBJECT
        </button>
      </div>
    );
  }

  const questions = currentAttempt.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const activeAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex + 1 === questions.length;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <h3 className="text-sm md:text-base font-black flex items-center gap-2 text-text-primary">
          <Star size={18} fill="#F6D86B" className="text-yellow-500" />
          <span>WASSCE Practice Session</span>
        </h3>
        <Link
          href="/study"
          className="p-1.5 border-2 border-border rounded-lg hover:bg-surface-muted transition-colors"
        >
          <X size={16} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-2.5 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
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

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t-2 border-border">
        <button
          type="button"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSubmittingFinal}
          className="px-4 py-2.5 border-2 border-border rounded-xl font-bold text-xs hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          PREVIOUS
        </button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={isSubmittingFinal}
              className="px-5 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] disabled:opacity-50 transition-all cursor-pointer"
            >
              NEXT QUESTION
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishQuiz}
              disabled={isSubmittingFinal}
              className="px-5 py-2.5 bg-emerald-400 text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmittingFinal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SUBMITTING...</span>
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
      </div>

      <EnergyWarningModal
        isOpen={showEnergyWarning}
        onClose={() => setShowEnergyWarning(false)}
        currentEnergy={userEnergy}
      />
    </div>
  );
}

export default function PracticeQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-bold">Loading quiz center...</span>
        </div>
      }
    >
      <PracticeQuizContent />
    </Suspense>
  );
}
