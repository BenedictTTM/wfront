"use client";
// MockExamSessionError — error boundary for mock exam session route segment
// Handles disconnected_grace and auto_submitted states as explicit UI, not crashes
export default function MockExamSessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return null;
}
