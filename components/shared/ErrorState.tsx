// components/shared/ErrorState.tsx

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  secondaryAction?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this view.",
  onRetry,
  retryText = "TRY AGAIN",
  secondaryAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[35vh] gap-3.5 text-center px-4">
      <div className="w-11 h-11 rounded-xl bg-destructive/10 border-2 border-border flex items-center justify-center text-destructive shadow-[0_2px_0_#141827]">
        <AlertCircle size={22} />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <h2 className="text-base font-black text-text-primary">{title}</h2>
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          {message}
        </p>
      </div>
      {(onRetry || secondaryAction) && (
        <div className="flex items-center gap-2.5 mt-1">
          {secondaryAction}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-text-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>{retryText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
