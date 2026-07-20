"use client";
// PdfViewerError — error boundary for PDF viewer route segment
// Handles RESOURCE_NOT_FOUND (404) as an empty state, not a crash
export default function PdfViewerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return null;
}
