"use client";

// app/(app)/study/mock-exams/page.tsx
// WASSCE Mock Exam Simulation page with LockIn™ immersive mode.
// State machine: IDLE → CONFIG_SELECT → COMMITMENT → INITIALIZING → ACTIVE_EXAM → TERMINATED | COMPLETED

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  ChevronRight,
} from "lucide-react";

import {
  CommitmentScreen,
  GraceCountdownOverlay,
  SessionTerminatedScreen,
  MockExamResultsScreen,
  ExamQuestionView,
} from "@/features/mock-exam/components";
import {
  useMockExamConfigs,
  useCreateMockExam,
  useCreateLockInSession,
  useLockInMonitor,
  useMockExamHeartbeat,
  useSaveMockExamAnswer,
  useSubmitMockExam,
  useCompleteLockInSession,
} from "@/features/mock-exam/hooks";
import { useLockIn } from "@/features/mock-exam/lockin-context";
import {
  MockExamConfig,
  MockExamAttempt,
  MockExamSubmitResult,
  MockExamPhase,
  AnswersMap,
  LockInSession,
} from "@/features/mock-exam/types";
import { useEnergy } from "@/features/gamification/hooks";
import { EnergyWarningModal } from "@/features/quiz/components";
import { useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { getMockExam, listMockExams, submitMockExam } from "@/features/mock-exam/api";

// ── Question type aligned with backend QuizAttempt.questions JSON ─────────────
type ExamQuestion = {
  id: string;
  text: string;
  options: { key: string; text: string }[];
  type: string;
  difficulty: string;
};

// ── Server-authoritative timer (local countdown synced on heartbeat) ───────────
function useServerTimer(
  initialSeconds: number,
  running: boolean,
): number {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  return seconds;
}

// ── Fetch questions from QuizAttempt (backend includes them in the exam) ──────
async function fetchExamQuestions(examId: string): Promise<ExamQuestion[]> {
  // GET /mock-exams/:id returns the exam; questions live in the linked QuizAttempt
  // We need to fetch the quiz attempt separately for question text/options
  // The mock exam response includes quizAttemptId which we use to fetch questions.
  // NOTE: questions are fetched from the quiz-attempts endpoint which returns
  // the attempt with full question details.
  const { apiGet } = await import("@/lib/api-client");
  const exam = await getMockExam(examId);
  const attempt = await apiGet<{ questions: ExamQuestion[] }>(
    `/quiz-attempts/${exam.quizAttemptId}`,
  );
  return attempt.questions || [];
}

// ─────────────────────────────────────────────────────────────────────────────

function MockExamContent() {
  const { setLockInActive } = useLockIn();
  const { data: meData } = useMe();
  const isGuest = !meData || isGuestIdentity(meData);
  const { data: energyData } = useEnergy();
  const userEnergy = energyData?.currentEnergy ?? 30;

  // ── Configs ────────────────────────────────────────────────────────────────
  const { data: configs, isLoading: configsLoading } = useMockExamConfigs();

  // ── Phase state machine ────────────────────────────────────────────────────
  const [phase, setPhase] = useState<MockExamPhase>("IDLE");
  const [selectedConfig, setSelectedConfig] = useState<MockExamConfig | null>(null);
  const [activeExam, setActiveExam] = useState<MockExamAttempt | null>(null);
  const [lockInSession, setLockInSession] = useState<LockInSession | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<AnswersMap>({});
  const [results, setResults] = useState<MockExamSubmitResult | null>(null);
  const [terminationReason, setTerminationReason] = useState<string | undefined>();
  const [showEnergyWarning, setShowEnergyWarning] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [focusScore, setFocusScore] = useState<number | undefined>();

  // Server-authoritative timer (decrements locally, synced on heartbeat response)
  const [serverSeconds, setServerSeconds] = useState(0);
  const timerSeconds = useServerTimer(
    serverSeconds,
    phase === "ACTIVE_EXAM",
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createExamMutation = useCreateMockExam();
  const createSessionMutation = useCreateLockInSession();
  const submitExamMutation = useSubmitMockExam();
  const completeSessionMutation = useCompleteLockInSession();
  const { save: saveAnswer } = useSaveMockExamAnswer(activeExam?.id ?? null);

  // ── Mock exam heartbeat (every 20s, keeps backend alive) ──────────────────
  useMockExamHeartbeat(activeExam?.id ?? null, phase === "ACTIVE_EXAM");

  // ── LockIn™ monitor ───────────────────────────────────────────────────────
  const handleTerminate = useCallback(
    (reason: string) => {
      setTerminationReason(reason);
      setPhase("TERMINATED");
      setLockInActive(false);
    },
    [setLockInActive],
  );

  const { gracePeriodRemaining, isFullscreen, isFocused } = useLockInMonitor(
    phase === "ACTIVE_EXAM" ? lockInSession?.id ?? null : null,
    phase === "ACTIVE_EXAM" ? activeExam?.id ?? null : null,
    phase === "ACTIVE_EXAM" ? activeExam?.startedAt ?? null : null,
    handleTerminate,
  );

  // ── Immersive mode toggle ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "ACTIVE_EXAM") {
      setLockInActive(true);
    } else {
      setLockInActive(false);
    }
    return () => setLockInActive(false);
  }, [phase, setLockInActive]);

  // ── Config selection ──────────────────────────────────────────────────────
  const handleSelectConfig = (config: MockExamConfig) => {
    if (isGuest) {
      toast.error("Mock exams require a registered account. Please sign in.");
      return;
    }
    if (userEnergy < 3) {
      setShowEnergyWarning(true);
      return;
    }
    setSelectedConfig(config);
    setPhase("COMMITMENT");
  };

  // ── Begin simulation ──────────────────────────────────────────────────────
  const handleBeginSimulation = async () => {
    if (!selectedConfig) return;
    setPhase("INITIALIZING");

    try {
      // 1. Create the mock exam session
      const exam = await createExamMutation.mutateAsync({
        mockExamConfigId: selectedConfig.id,
      });
      setActiveExam(exam);
      setServerSeconds(exam.secondsRemaining);

      // 2. Fetch exam questions via quiz attempt
      const examQuestions = await fetchExamQuestions(exam.id);
      setQuestions(examQuestions);

      // 3. Create LockIn™ session
      const session = await createSessionMutation.mutateAsync(exam.id);
      setLockInSession(session);

      // 4. Reset answer state
      setAnswersMap({});
      setCurrentIndex(0);
      setResults(null);
      setTerminationReason(undefined);

      // 5. Enter active exam phase
      setPhase("ACTIVE_EXAM");
    } catch (err: any) {
      const msg = err?.message || "Failed to start simulation";
      
      // Handle stale active exam sessionconflict automatically
      if (
        msg.toLowerCase().includes("active exam session") ||
        err?.status === 409
      ) {
        try {
          const list = await listMockExams({ limit: 10 });
          const ongoing = list.data.find(
            (e) => e.status === "ONGOING" || e.status === "DISCONNECTED_GRACE",
          );
          if (ongoing) {
            // Submit/close the lingering abandoned exam
            await submitMockExam(ongoing.id).catch(() => {});
            
            // Retry starting the new exam session
            const retryExam = await createExamMutation.mutateAsync({
              mockExamConfigId: selectedConfig.id,
            });
            setActiveExam(retryExam);
            setServerSeconds(retryExam.secondsRemaining);
            const examQuestions = await fetchExamQuestions(retryExam.id);
            setQuestions(examQuestions);
            const session = await createSessionMutation.mutateAsync(retryExam.id);
            setLockInSession(session);
            setAnswersMap({});
            setCurrentIndex(0);
            setResults(null);
            setTerminationReason(undefined);
            setPhase("ACTIVE_EXAM");
            return;
          }
        } catch {
          // Fall back to showing standard error message if auto-cleanup fails
        }
      }

      toast.error(msg);
      if (msg.toLowerCase().includes("energy")) setShowEnergyWarning(true);
      setPhase("IDLE");
      setSelectedConfig(null);
    }
  };

  // ── Answer selection ──────────────────────────────────────────────────────
  const handleSelectOption = useCallback(
    (questionId: string, optionKey: string) => {
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], selectedOptionId: optionKey },
      }));
      saveAnswer(questionId, optionKey, undefined);
    },
    [saveAnswer],
  );

  const handleChangeText = useCallback(
    (questionId: string, text: string) => {
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], submittedText: text },
      }));
    },
    [],
  );

  // ── Question navigation ───────────────────────────────────────────────────
  const handleNext = async () => {
    const q = questions[currentIndex];
    if (q) {
      const ans = answersMap[q.id];
      if (ans?.submittedText?.trim()) {
        await saveAnswer(q.id, undefined, ans.submittedText);
      }
    }
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // ── Submit exam ───────────────────────────────────────────────────────────
  const handleSubmitExam = async () => {
    if (!activeExam || !lockInSession || isSubmittingExam) return;
    setIsSubmittingExam(true);

    try {
      // Save any unsaved text answer
      const q = questions[currentIndex];
      if (q) {
        const ans = answersMap[q.id];
        if (ans?.submittedText?.trim()) {
          await saveAnswer(q.id, undefined, ans.submittedText);
        }
      }

      // Submit the exam
      const submitResults = await submitExamMutation.mutateAsync(activeExam.id);
      setResults(submitResults);

      // Complete the LockIn session and capture focus score
      const completedSession = await completeSessionMutation.mutateAsync(lockInSession.id);
      setFocusScore(completedSession.focusScore);

      setLockInActive(false);
      setPhase("COMPLETED");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit exam. Please try again.");
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleStartNew = () => {
    setPhase("IDLE");
    setSelectedConfig(null);
    setActiveExam(null);
    setLockInSession(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswersMap({});
    setResults(null);
    setTerminationReason(undefined);
    setFocusScore(undefined);
    setServerSeconds(0);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ── Renders by phase ─────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  // ── TERMINATED ───────────────────────────────────────────────────────────
  if (phase === "TERMINATED") {
    return (
      <div className="flex flex-col gap-6 py-4">
        <SessionTerminatedScreen reason={terminationReason} />
      </div>
    );
  }

  // ── COMPLETED ─────────────────────────────────────────────────────────────
  if (phase === "COMPLETED" && results) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <MockExamResultsScreen
          results={results}
          focusScore={focusScore}
          onStartNew={handleStartNew}
        />
      </div>
    );
  }

  // ── ACTIVE EXAM ───────────────────────────────────────────────────────────
  if (phase === "ACTIVE_EXAM" && activeExam && questions.length > 0) {
    return (
      <>
        {/* Grace countdown overlay (portal-like, fixed position) */}
        {gracePeriodRemaining !== null && (
          <GraceCountdownOverlay remaining={gracePeriodRemaining} />
        )}

        {/* Exam question view — fills full available width in immersive mode */}
        <div className="flex flex-col py-4">
          <ExamQuestionView
            exam={activeExam}
            questions={questions}
            currentIndex={currentIndex}
            answersMap={answersMap}
            secondsRemaining={timerSeconds}
            isLockInActive={true}
            gracePeriodRemaining={gracePeriodRemaining}
            isSubmitting={isSubmittingExam}
            onSelectOption={handleSelectOption}
            onChangeText={handleChangeText}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmitExam}
          />
        </div>
      </>
    );
  }

  // ── INITIALIZING ──────────────────────────────────────────────────────────
  if (phase === "INITIALIZING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141827] border-2 border-[#141827] flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.6)]">
          <Loader2 size={28} className="text-[#F6D86B] animate-spin" />
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-lg font-black text-[#141827]">Initializing Simulation</h3>
          <p className="text-sm text-[#5C6470]">
            Preparing your examination environment...
          </p>
        </div>
      </div>
    );
  }

  // ── COMMITMENT ────────────────────────────────────────────────────────────
  if (phase === "COMMITMENT" && selectedConfig) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div>
          <button
            type="button"
            onClick={() => { setPhase("IDLE"); setSelectedConfig(null); }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#5C6470] hover:text-[#141827] transition-colors"
          >
            <ArrowLeft size={12} />
            Back to exams
          </button>
        </div>
        <CommitmentScreen
          config={selectedConfig}
          onBegin={handleBeginSimulation}
          onCancel={() => { setPhase("IDLE"); setSelectedConfig(null); }}
          isInitializing={phase === "INITIALIZING" as any}
        />
      </div>
    );
  }

  // ── IDLE — Config picker ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div>
          <Link
            href="/study"
            className="flex items-center gap-1.5 text-xs font-bold text-[#5C6470] hover:text-[#141827] transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Study Center
          </Link>
        </div>
        <h2 className="text-2xl font-extrabold text-[#141827]">WASSCE Mock Exams</h2>
        <p className="text-sm text-[#5C6470]">
          Select an exam to begin a full LockIn™ simulation.
        </p>
      </div>

      {/* Guest warning */}
      {isGuest && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3">
          <Award size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-amber-800">Sign in required</p>
            <p className="text-xs text-amber-700">
              Mock exams are only available to registered students.{" "}
              <Link href="/login" className="font-black underline">Sign in</Link> to begin.
            </p>
          </div>
        </div>
      )}

      {/* Config list */}
      {configsLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#F5F1E8] border-2 border-[#141827]/10 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : configs && configs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="p-6 border-2 border-[#141827] bg-white rounded-xl shadow-[0_4px_0_#141827] flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#141827] transition-all duration-150"
            >
              {/* Config header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-base text-[#141827]">{config.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#5C6470]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {Math.floor(config.durationSeconds / 60)}m
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={11} />
                      {config.questionCount} questions
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 shrink-0 bg-[#141827] border-2 border-[#141827] rounded-xl flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                  <Award size={18} className="text-[#F6D86B]" />
                </div>
              </div>

              {/* LockIn™ mode indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F1E8] border border-[#141827]/10 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5C6470]">
                  LockIn™ Mode — Immersive examination environment
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSelectConfig(config)}
                disabled={isGuest}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#141827] text-white border-2 border-[#141827] rounded-xl font-black text-sm shadow-[0_3px_0_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_0.5px_0_rgba(0,0,0,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Begin Simulation
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 border-2 border-[#141827]/10 bg-[#F5F1E8] rounded-xl flex flex-col items-center gap-3 text-center">
          <FileText size={32} className="text-[#5C6470]" strokeWidth={1.5} />
          <p className="font-bold text-[#141827]">No exam configurations available</p>
          <p className="text-xs text-[#5C6470]">
            Exam configurations are created by your school administrators.
          </p>
        </div>
      )}

      <EnergyWarningModal
        isOpen={showEnergyWarning}
        onClose={() => setShowEnergyWarning(false)}
        currentEnergy={userEnergy}
      />
    </div>
  );
}

export default function MockExamsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-[#F6D86B]" />
        </div>
      }
    >
      <MockExamContent />
    </Suspense>
  );
}
