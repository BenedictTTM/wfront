"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StudyCenterSkeleton() {
  return (
    <div className="flex flex-col gap-8 py-2 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44 rounded-lg bg-surface-muted border border-border/20" />
        <Skeleton className="h-4 w-80 rounded-md bg-surface-muted border border-border/20" />
      </div>

      {/* Hero Continue Journey Card Skeleton */}
      <div className="w-full bg-surface border-[3px] border-border/40 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex items-center justify-between border-b-[2px] border-border/20 pb-4">
          <Skeleton className="h-5 w-36 rounded-full bg-surface-muted" />
          <Skeleton className="h-5 w-16 rounded-md bg-surface-muted" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-28 rounded-md bg-surface-muted" />
          <Skeleton className="h-7 w-64 rounded-lg bg-surface-muted" />
          <Skeleton className="h-4 w-96 rounded-md bg-surface-muted" />
        </div>

        <div className="flex flex-col gap-2 bg-surface-muted/40 p-4 border border-border/20 rounded-xl">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-24 rounded bg-surface-muted" />
            <Skeleton className="h-3.5 w-32 rounded bg-surface-muted" />
          </div>
          <Skeleton className="h-3 w-full rounded-full bg-surface-muted" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-6 w-24 rounded-lg bg-surface-muted" />
            <Skeleton className="h-6 w-28 rounded-lg bg-surface-muted" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 flex-1 rounded-xl bg-surface-muted" />
          <Skeleton className="h-12 w-36 rounded-xl bg-surface-muted" />
        </div>
      </div>

      {/* Play Modes Skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32 rounded bg-surface-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl bg-surface border-[2px] border-border/30" />
          <Skeleton className="h-36 rounded-2xl bg-surface border-[2px] border-border/30" />
        </div>
      </div>

      {/* Subjects Skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40 rounded bg-surface-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl bg-surface border-[2px] border-border/30" />
          <Skeleton className="h-20 rounded-xl bg-surface border-[2px] border-border/30" />
          <Skeleton className="h-20 rounded-xl bg-surface border-[2px] border-border/30" />
          <Skeleton className="h-20 rounded-xl bg-surface border-[2px] border-border/30" />
        </div>
      </div>
    </div>
  );
}
