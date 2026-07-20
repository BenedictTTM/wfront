"use client";
// QuizAttemptError — error boundary for quiz attempt route segment
// Handles RESOURCE_NOT_FOUND and other API errors inline (not as crashes)
export default function QuizAttemptError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return null;
}
