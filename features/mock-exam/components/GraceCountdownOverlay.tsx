"use client";

// features/mock-exam/components/GraceCountdownOverlay.tsx
// Countdown overlay shown when focus is lost during a LockIn™ session.
// Blocks the exam interface and counts down from 10 to 0.

import React, { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

interface GraceCountdownOverlayProps {
  remaining: number; // seconds remaining in grace period (10 to 0)
}

export function GraceCountdownOverlay({ remaining }: GraceCountdownOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the animated countdown ring
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const progress = remaining / 10; // 1.0 → 0.0

    ctx.clearRect(0, 0, size, size);

    // Track ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Progress arc (fills as time runs out — reversed)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.strokeStyle =
      remaining <= 3
        ? "#ef4444"
        : remaining <= 6
        ? "#f59e0b"
        : "rgba(255,255,255,0.7)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [remaining]);

  const urgency = remaining <= 3;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "rgba(10, 12, 22, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Pulsing vignette for urgency */}
      {urgency && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 120px rgba(239, 68, 68, 0.25)",
            animation: "pulse 0.8s ease-in-out infinite",
          }}
        />
      )}

      <div className="flex flex-col items-center gap-8 text-center px-8 max-w-sm">
        {/* Warning icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <TriangleAlert size={28} className="text-amber-400" strokeWidth={2} />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-white leading-tight">
            You left the simulation
          </h2>
          <p className="text-sm font-medium text-white/60 leading-relaxed">
            Return to this tab immediately or your simulation will end.
          </p>
        </div>

        {/* Countdown ring + number */}
        <div className="relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={120}
            height={120}
            className="absolute"
          />
          <div className="flex flex-col items-center justify-center w-[120px] h-[120px]">
            <span
              className="font-black leading-none tabular-nums transition-all duration-300"
              style={{
                fontSize: "3.5rem",
                color: urgency ? "#ef4444" : "white",
                textShadow: urgency ? "0 0 20px rgba(239,68,68,0.5)" : "none",
              }}
            >
              {remaining}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              sec
            </span>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-white/30 font-medium">
          Click anywhere or switch back to this tab to resume.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
