// features/analytics/components/AnalyticsSkeleton.tsx

import React from "react";

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {/* 1. Performance Snapshot Skeleton */}
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-36 bg-surface-muted rounded-md border border-border/20" />
        <div className="h-16 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]"
            />
          ))}
        </div>
      </div>

      {/* 3. Subject Performance Skeleton */}
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-40 bg-surface-muted rounded-md border border-border/20" />
        <div className="h-60 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]" />
      </div>

      {/* 4. Strengths / Needs Attention Skeleton */}
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-48 bg-surface-muted rounded-md border border-border/20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-56 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]" />
          <div className="h-56 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]" />
        </div>
      </div>

      {/* 5. Topic Mastery Skeleton */}
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-28 bg-surface-muted rounded-md border border-border/20" />
        <div className="h-48 bg-surface border-2.5 border-border rounded-2xl shadow-[0_3px_0_#141827]" />
      </div>
    </div>
  );
}
