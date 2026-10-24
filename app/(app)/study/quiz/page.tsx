"use client";

import React, { Suspense, useEffect } from "react";
import { BookOpen, X, Loader2, Sparkles, ChevronLeft, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizSession } from "@/features/quiz/use-quiz-session";
import {
  QuestionCard,
  OptionSelector,
  QuizResultsScreen,
  EnergyWarningModal,
  FlashcardReview,
} from "@/features/quiz/components";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-surface border-[2px] border-border rounded-xl shadow-[0_4px_0_rgba(20,24,39,0.9)] p-8 flex flex-col items-center justify-center gap-3 text-text-secondary">
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
      <span className="text-xs font-black text-text-primary">{label}</span>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function PracticeQuizContent() {
  const router = useRouter();
  const {
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
    createAttemptPending,
    loadingFlashcards,
    flashcardsData,
    attemptError,
    hasAutoStartParams,
    userEnergy,
    handleSelectOption,
    handleChangeText,
    handleNextQuestion,
    handlePreviousQuestion,
    handleFinishQuiz,
    handleResetQuiz,
    handleExitSession,
    handleContinueNextLevel,
  } = useQuizSession();

  // Redirect to /study when no active attempt or start params exist
  useEffect(() => {
    if (
      !hasAutoStartParams &&
      !activeAttemptId &&
      !currentAttempt &&
      !loadingAttempt &&
      !createAttemptPending
    ) {
      router.replace("/study");
    }
  }, [
    hasAutoStartParams,
    activeAttemptId,
    currentAttempt,
    loadingAttempt,
    createAttemptPending,
    router,
  ]);

  // ── Results Screen ───────────────────────────────────────────────────────────
  if (submissionResults) {
    return (
      <div className="w-full max-w-lg mx-auto bg-surface border-[2.5px] border-border rounded-xl shadow-[0_4px_0_rgba(20,24,39,0.9)] p-4 sm:p-5">
        <QuizResultsScreen
          results={submissionResults}
          onReset={handleResetQuiz}
          onContinueNextLevel={handleContinueNextLevel}
        />
      </div>
    );
  }

  // ── Loading Quiz Attempt or Results ───────────────────────────────────────────
  if (
    loadingAttempt ||
    createAttemptPending ||
    (currentAttempt?.status === "SUBMITTED" && !submissionResults) ||
    (hasAutoStartParams && !currentAttempt && !attemptError && !showEnergyWarning)
  ) {
    return (
      <>
        <LoadingCard
          label={
            currentAttempt?.status === "SUBMITTED"
              ? "Loading your quiz results…"
              : "Preparing challenge questions…"
          }
        />
        <EnergyWarningModal
          isOpen={showEnergyWarning}
          onClose={() => setShowEnergyWarning(false)}
          currentEnergy={userEnergy}
        />
      </>
    );
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
  if (
    attemptError ||
    (currentAttempt && (!currentAttempt.questions || currentAttempt.questions.length === 0))
  ) {
    const errorMsg =
      attemptError instanceof Error
        ? attemptError.message
        : "No questions currently configured for this challenge level.";

    return (
      <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-8 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
          <X size={24} className="text-text-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-black text-text-primary">Unable to Load Challenge</h4>
          <p className="text-xs text-text-secondary max-w-sm">
            {errorMsg}
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
            RETURN TO STUDY
          </Link>
        </div>
      </div>
    );
  }

  // ── No active session and no auto-start params -> Redirecting to Study Center ───
  if (!activeAttemptId && !currentAttempt) {
    return <LoadingCard label="Redirecting to Study Center…" />;
  }

  // ── Active Quiz Session ───────────────────────────────────────────────────────
  if (!currentAttempt || !currentAttempt.questions) {
    return <LoadingCard label="Preparing challenge questions…" />;
  }

  const questions = currentAttempt.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const activeAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const currentFeedback = currentQuestion ? feedbackMap[currentQuestion.id] : undefined;
  const isAnswered = Boolean(activeAnswer?.selectedOptionId || activeAnswer?.submittedText?.trim());
  const isLastQuestion = currentQuestionIndex + 1 === questions.length;
  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isJourneyMode = currentAttempt.mode === "JOURNEY";

  return (
    <div className="w-full max-w-lg mx-auto bg-surface border-[2.5px] border-border rounded-2xl shadow-[0_5px_0_rgba(20,24,39,0.9)] p-4 sm:p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
      {/* Header HUD */}
      <div className="flex items-center justify-between border-b-[2px] border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_1.5px_0_#141827] shrink-0">
            <BookOpen size={16} className="text-text-primary stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-text-primary leading-tight">
              {isJourneyMode ? "Journey Challenge" : "WASSCE Practice Session"}
            </h3>
            <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
              {isJourneyMode ? "Level Progression" : "Skill Drill"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExitSession}
          className="p-1.5 border-[1.5px] border-border rounded-lg bg-surface hover:bg-bg-primary shadow-[0_1.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          aria-label="Exit session"
        >
          <X size={15} className="text-text-primary stroke-[2.5]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-2.5 border-[2px] border-border rounded-full bg-surface-muted overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-primary border-[1px] border-border transition-all duration-300 rounded-full shadow-xs"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-text-secondary">
          <span className="bg-bg-primary px-2 py-0.5 border border-border rounded-md shadow-xs">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="bg-bg-primary px-2 py-0.5 border border-border rounded-md shadow-xs">
            {Math.round(progressPct)}% Completed
          </span>
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
            "p-3.5 border-[2px] rounded-xl flex flex-col gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-[0_2.5px_0_rgba(20,24,39,0.9)]",
            currentFeedback.isCorrect
              ? "bg-emerald-500/15 border-emerald-700 text-emerald-950 dark:text-emerald-200"
              : "bg-rose-500/15 border-rose-700 text-rose-950 dark:text-rose-200",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 font-black text-xs">
            {currentFeedback.isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                <span>Brilliant! That is correct.</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 stroke-[2.5]" />
                <span>
                  Not quite. {currentFeedback.correctOption ? `Correct answer is Option (${currentFeedback.correctOption}).` : ""}
                </span>
              </>
            )}
          </div>

          {currentFeedback.explanation && (
            <div className="text-[11px] font-bold text-text-secondary bg-surface p-2.5 rounded-lg border-[1.5px] border-border mt-0.5 shadow-[0_1px_0_#141827]">
              <span className="font-black text-text-primary block text-[9px] uppercase tracking-wider mb-0.5">
                💡 Explanation &amp; Key Insight
              </span>
              <p className="leading-relaxed text-text-primary font-medium">
                {currentFeedback.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-3 border-t-[2px] border-border">
        <button
          type="button"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSubmittingFinal}
          className="flex items-center gap-1.5 px-3.5 py-2 border-[1.5px] border-border bg-surface hover:bg-bg-primary rounded-lg font-black text-[11px] shadow-[0_1.5px_0_#141827] active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={14} className="stroke-[2.5]" />
          <span>PREVIOUS</span>
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={!isAnswered || isSubmittingFinal}
            className="px-4 py-2 bg-primary text-text-primary border-[2px] border-border rounded-lg font-black text-[11px] shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>NEXT QUESTION</span>
            <ArrowRight size={14} className="stroke-[3]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishQuiz}
            disabled={!isAnswered || isSubmittingFinal}
            className="px-4 py-2 bg-primary text-text-primary border-[2px] border-border rounded-lg font-black text-[11px] shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {isSubmittingFinal ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[3]" />
                <span>EVALUATING…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="stroke-[2.5]" />
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
