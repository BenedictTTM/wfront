// components/shared/EmptyState.tsx

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="p-8 sm:p-10 bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] text-center flex flex-col items-center gap-4 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-surface-muted border-2 border-border flex items-center justify-center text-text-secondary">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-black text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="mt-1 px-5 py-2.5 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              {actionText}
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-1 px-5 py-2.5 bg-primary hover:bg-primary-hover border-2 border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              {actionText}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
