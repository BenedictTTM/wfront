"use client";

import React, { Suspense } from "react";
import { BookOpen, X, Loader2, Sparkles, ChevronLeft, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuizSession } from "@/features/quiz/use-quiz-session";
import {
  SubjectTopicSelector,
  QuestionCard,
  OptionSelector,
  QuizResultsScreen,
  EnergyWarningModal,
  FlashcardReview,
} from "@/features/quiz/components";

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
    handleStartQuiz,
    handleSelectOption,
    handleChangeText,
    handleNextQuestion,
    handlePreviousQuestion,
    handleFinishQuiz,
    handleResetQuiz,
    handleExitSession,
    handleContinueNextLevel,
  } = useQuizSession();

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

  // ── Selector (fallback ONLY if no active session and no auto-start params) ───
  if (!activeAttemptId && !currentAttempt) {
    return (
      <>
        <SubjectTopicSelector
          onStartQuiz={(subjectId, topicId, mode) =>
            handleStartQuiz({ subjectId, topicId, mode })
          }
          isStarting={createAttemptPending}
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
