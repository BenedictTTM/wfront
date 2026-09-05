"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary caught error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md bg-card border-[3px] border-destructive/40 shadow-offset rounded-xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-destructive/10 border-2 border-destructive/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h1>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          An unexpected error occurred while loading this page. You can try refreshing the component or returning to your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-foreground border-2 border-border shadow-offset rounded-lg px-6 py-3.5 font-bold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full bg-surface text-foreground border-2 border-border rounded-lg px-6 py-3.5 font-bold hover:bg-muted/50 transition-all inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
