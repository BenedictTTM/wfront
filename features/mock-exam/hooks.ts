"use client";

// features/mock-exam/hooks.ts
// TanStack Query hooks + useLockInMonitor for the full mock exam + LockIn™ flow

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateIdempotencyKey } from "@/lib/idempotency";
import {
  createMockExam,
  createLockInSession,
  getLockInSessionByExam,
  getMockExam,
  listMockExamConfigs,
  listMockExams,
  recordLockInEvent,
  sendLockInHeartbeat,
  sendMockExamHeartbeat,
  submitMockExam,
  terminateLockInSession,
  completeLockInSession,
  upsertMockExamAnswer,
} from "./api";
import {
  CreateMockExamPayload,
  LockInEventType,
  LockInHeartbeatAction,
  MockExamAnswer,
} from "./types";
import { AudioService } from "./services/audio-service";
import { NotificationService } from "./services/notification-service";

// ── Config ────────────────────────────────────────────────────────────────────

export function useMockExamConfigs(subjectId?: string) {
  return useQuery({
    queryKey: ["mock-exam", "configs", subjectId],
    queryFn: () => listMockExamConfigs(subjectId),
    staleTime: 5 * 60 * 1000, // configs rarely change
  });
}

// ── Create Exam ───────────────────────────────────────────────────────────────

export function useCreateMockExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMockExamPayload) => createMockExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["mock-exam", "list"] });
    },
  });
}

// ── Get Active Exam ───────────────────────────────────────────────────────────

export function useMockExam(examId: string | null) {
  return useQuery({
    queryKey: ["mock-exam", examId],
    queryFn: () => getMockExam(examId!),
    enabled: !!examId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ── Mock Exam Heartbeat (every 20 seconds) ────────────────────────────────────

export function useMockExamHeartbeat(examId: string | null, enabled: boolean) {
  useEffect(() => {
    if (!examId || !enabled) return;

    const interval = setInterval(async () => {
      try {
        await sendMockExamHeartbeat(examId);
      } catch {
        // Heartbeat failure is non-fatal — the backend has its own grace window
      }
    }, 20_000);

    return () => clearInterval(interval);
  }, [examId, enabled]);
}

// ── Upsert Answer ─────────────────────────────────────────────────────────────

export function useUpsertMockExamAnswer() {
  return useMutation({
    mutationFn: ({
      examId,
      answer,
      idempotencyKey,
    }: {
      examId: string;
      answer: MockExamAnswer;
      idempotencyKey: string;
    }) => upsertMockExamAnswer(examId, answer, idempotencyKey),
  });
}

// ── Submit Exam ───────────────────────────────────────────────────────────────

export function useSubmitMockExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => submitMockExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["mock-exam", "list"] });
    },
  });
}

// ── Exam History ──────────────────────────────────────────────────────────────

export function useMockExamList(query?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ["mock-exam", "list", query],
    queryFn: () => listMockExams(query),
    staleTime: 30_000,
  });
}

// ── Create LockIn Session ─────────────────────────────────────────────────────

export function useCreateLockInSession() {
  return useMutation({
    mutationFn: (mockExamId: string) => createLockInSession(mockExamId),
  });
}

// ── Get LockIn Session ────────────────────────────────────────────────────────

export function useLockInSession(mockExamId: string | null) {
  return useQuery({
    queryKey: ["lockin", "session", mockExamId],
    queryFn: () => getLockInSessionByExam(mockExamId!),
    enabled: !!mockExamId,
    staleTime: 0,
  });
}

// ── Record LockIn Event ───────────────────────────────────────────────────────

export function useRecordLockInEvent() {
  return useMutation({
    mutationFn: ({
      sessionId,
      eventType,
      metadata,
    }: {
      sessionId: string;
      eventType: LockInEventType;
      metadata?: Record<string, unknown>;
    }) => recordLockInEvent(sessionId, eventType, metadata),
  });
}

// ── Complete LockIn Session ───────────────────────────────────────────────────

export function useCompleteLockInSession() {
  return useMutation({
    mutationFn: (sessionId: string) => completeLockInSession(sessionId),
  });
}

// ── useLockInMonitor ──────────────────────────────────────────────────────────
// Core monitoring hook for the LockIn™ immersive exam mode.
// Manages: Visibility API, window focus/blur, fullscreen changes, beforeunload,
//          20-second focus heartbeats, and the 10-second grace countdown.

const GRACE_SECONDS = 10;
const HEARTBEAT_INTERVAL_MS = 20_000;

type LockInMonitorState = {
  gracePeriodRemaining: number | null; // null = not in grace period
  isFullscreen: boolean;
  isFocused: boolean;
};

export function useLockInMonitor(
  sessionId: string | null,
  examId: string | null,
  examStartedAt: string | null,
  onTerminate: (reason: string) => void,
): LockInMonitorState {
  const [gracePeriodRemaining, setGracePeriodRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Refs so callbacks always see current values without re-registering listeners
  const sessionIdRef = useRef(sessionId);
  const examIdRef = useRef(examId);
  const examStartedAtRef = useRef(examStartedAt);
  const isFocusedRef = useRef(true);
  const isVisibleRef = useRef(true);
  const isTerminatedRef = useRef(false);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceRemainingRef = useRef<number>(GRACE_SECONDS);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    examIdRef.current = examId;
  }, [examId]);

  useEffect(() => {
    examStartedAtRef.current = examStartedAt;
  }, [examStartedAt]);

  // Helper: fire-and-forget event record
  const recordEvent = useCallback(
    (eventType: LockInEventType, metadata?: Record<string, unknown>) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      recordLockInEvent(sid, eventType, metadata).catch(() => {});
    },
    [],
  );

  // Helper: compute elapsed seconds from exam start
  const getElapsedSeconds = useCallback((): number => {
    if (!examStartedAtRef.current) return 0;
    return Math.floor(
      (Date.now() - new Date(examStartedAtRef.current).getTime()) / 1000,
    );
  }, []);

  // Start the 10-second countdown
  const startGracePeriod = useCallback(() => {
    if (graceTimerRef.current) return; // already counting

    graceRemainingRef.current = GRACE_SECONDS;
    setGracePeriodRemaining(GRACE_SECONDS);

    graceTimerRef.current = setInterval(() => {
      graceRemainingRef.current -= 1;
      setGracePeriodRemaining(graceRemainingRef.current);

      if (graceRemainingRef.current <= 0) {
        clearInterval(graceTimerRef.current!);
        graceTimerRef.current = null;
        setGracePeriodRemaining(null);

        if (!isTerminatedRef.current) {
          isTerminatedRef.current = true;
          NotificationService.getInstance().closeNotification();
          AudioService.getInstance().playSessionFailed();
          const reason = "Grace period expired — focus commitment broken";
          const sid = sessionIdRef.current;
          if (sid) {
            terminateLockInSession(sid, reason).catch(() => {});
          }
          onTerminate(reason);
        }
      }
    }, 1000);
  }, [onTerminate]);

  // Cancel the grace period countdown
  const cancelGracePeriod = useCallback(() => {
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    setGracePeriodRemaining(null);
  }, []);

  // Handle focus loss (both blur and visibilitychange)
  const handleFocusLoss = useCallback(
    (reason: LockInEventType) => {
      if (isTerminatedRef.current) return;
      isFocusedRef.current = false;
      isVisibleRef.current = document.visibilityState === "visible";
      setIsFocused(false);
      recordEvent(reason);
      AudioService.getInstance().playFocusLost();
      NotificationService.getInstance().showFocusLostNotification();
      startGracePeriod();
    },
    [recordEvent, startGracePeriod],
  );

  // Handle focus return
  const handleFocusReturn = useCallback(() => {
    if (isTerminatedRef.current) return;
    isFocusedRef.current = true;
    isVisibleRef.current = true;
    setIsFocused(true);
    cancelGracePeriod();
    AudioService.getInstance().stop();
    AudioService.getInstance().playFocusRestored();
    NotificationService.getInstance().closeNotification();
    recordEvent("FOCUS_RETURNED");
  }, [recordEvent, cancelGracePeriod]);

  // Effect: register all browser event listeners
  useEffect(() => {
    if (!sessionId || !examId) return;

    // Request fullscreen (non-blocking — never block exam on denial)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }

    // visibilitychange: tab switch / minimize
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleFocusLoss("TAB_SWITCH");
      } else {
        handleFocusReturn();
      }
    };

    // window.blur: app loses focus (OS switch, DevTools, etc.)
    const onWindowBlur = () => {
      if (!isFocusedRef.current) return;
      handleFocusLoss("WINDOW_BLUR");
    };

    // window.focus: app regains focus
    const onWindowFocus = () => {
      if (document.visibilityState === "visible") {
        handleFocusReturn();
      }
    };

    // fullscreenchange
    const onFullscreenChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs) {
        recordEvent("FULLSCREEN_EXIT");
      } else {
        recordEvent("FULLSCREEN_ENTER");
      }
    };

    // beforeunload: warn user that leaving ends the simulation
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Leaving this page will end your LockIn™ simulation. Are you sure?";
    };

    // pagehide: terminate LockIn session immediately on backend if page is closed/navigated away
    const onPageHide = () => {
      const sid = sessionIdRef.current;
      if (sid && !isTerminatedRef.current) {
        isTerminatedRef.current = true;
        terminateLockInSession(sid, "User left examination environment").catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);

    // 20-second focus heartbeat to LockIn™ session
    heartbeatTimerRef.current = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (!sid || isTerminatedRef.current) return;

      try {
        const response = await sendLockInHeartbeat(sid, {
          visibility: isVisibleRef.current,
          focused: isFocusedRef.current,
          fullscreen: !!document.fullscreenElement,
          elapsedSeconds: getElapsedSeconds(),
        });

        // Server-side TERMINATE signal (e.g., manipulated client)
        if (response.action === "TERMINATE" && !isTerminatedRef.current) {
          isTerminatedRef.current = true;
          cancelGracePeriod();
          onTerminate("Server terminated the session due to suspicious activity");
        }
      } catch {
        // Network failure — non-fatal, client-side grace period already handles this
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      // Cleanup all listeners and timers
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);

      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (graceTimerRef.current) clearInterval(graceTimerRef.current);

      // Exit fullscreen on cleanup
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [
    sessionId,
    examId,
    handleFocusLoss,
    handleFocusReturn,
    recordEvent,
    cancelGracePeriod,
    getElapsedSeconds,
    onTerminate,
  ]);

  return { gracePeriodRemaining, isFullscreen, isFocused };
}

// ── Idempotent answer save helper ─────────────────────────────────────────────

/**
 * Returns a stable save function that generates a fresh idempotency key
 * per logical answer action, preventing duplicate submissions on retry.
 */
export function useSaveMockExamAnswer(examId: string | null) {
  const mutation = useUpsertMockExamAnswer();

  const save = useCallback(
    async (
      questionId: string,
      selectedOptionId?: string,
      submittedText?: string,
    ) => {
      if (!examId || (!selectedOptionId && !submittedText?.trim())) return;
      const key = generateIdempotencyKey();
      try {
        await mutation.mutateAsync({
          examId,
          answer: {
            questionId,
            selectedOptionId: selectedOptionId || undefined,
            submittedText: submittedText?.trim() || undefined,
          },
          idempotencyKey: key,
        });
      } catch (err) {
        // Silent — we retry on next answer interaction
        console.warn("[MockExam] Failed to save answer:", err);
      }
    },
    [examId, mutation],
  );

  return { save, isSaving: mutation.isPending };
}
