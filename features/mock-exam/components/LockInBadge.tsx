"use client";

// features/mock-exam/components/LockInBadge.tsx
// Small status badge shown in the exam header during an active LockIn™ session.

import React from "react";
import { Shield } from "lucide-react";

interface LockInBadgeProps {
  isActive: boolean;
  gracePeriodRemaining: number | null;
}

export function LockInBadge({ isActive, gracePeriodRemaining }: LockInBadgeProps) {
  if (!isActive) return null;

  const isInGrace = gracePeriodRemaining !== null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all duration-300"
      style={{
        background: isInGrace ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.08)",
        borderColor: isInGrace ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)",
        color: isInGrace ? "#ef4444" : "#22c55e",
      }}
    >
      {/* Pulsing status dot */}
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: isInGrace ? "#ef4444" : "#22c55e" }}
        />
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ backgroundColor: isInGrace ? "#ef4444" : "#22c55e" }}
        />
      </span>

      <Shield size={11} strokeWidth={2.5} />

      {isInGrace ? (
        <span>
          Returning in{" "}
          <span className="font-black tabular-nums">{gracePeriodRemaining}s</span>
        </span>
      ) : (
        <span>LockIn™ Active</span>
      )}
    </div>
  );
}
