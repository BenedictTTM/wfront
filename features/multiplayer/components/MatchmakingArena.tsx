"use client";
// features/multiplayer/components/MatchmakingArena.tsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap, Sparkles, Wifi } from "lucide-react";

import {
  MatchmakingProps,
  MatchmakingState,
  getMatchmakingStatusText,
  formatElapsedDisplay,
  CLASH_ANIMATION_DURATION_MS,
  RADAR_RINGS_CONFIG,
} from "../utils/matchmaking-arena";

export type { MatchmakingProps, MatchmakingState };

export const MatchmakingArena = React.memo(function MatchmakingArena({
  currentUser,
  matchedOpponent,
  elapsedSeconds,
  onReadyToStart,
  onCancel,
  isCancelling = false,
}: MatchmakingProps) {
  const [matchState, setMatchState] = useState<MatchmakingState>("SEARCHING");

  // State machine sequence:
  // SEARCHING -> RIVAL_FOUND (when matchedOpponent is present) -> TRANSITION_TO_MATCH (after 800ms)
  useEffect(() => {
    if (!matchedOpponent) {
      setMatchState("SEARCHING");
      return;
    }

    setMatchState("RIVAL_FOUND");

    const timer = setTimeout(() => {
      setMatchState("TRANSITION_TO_MATCH");
      onReadyToStart();
    }, 800);

    return () => clearTimeout(timer);
  }, [matchedOpponent, onReadyToStart]);

  const isRivalFound = matchState === "RIVAL_FOUND" || matchState === "TRANSITION_TO_MATCH";
  const statusText = getMatchmakingStatusText(elapsedSeconds);

  return (
    <div
      role="region"
      aria-label="Matchmaking arena"
      className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center p-2 select-none"
    >
      <AnimatePresence mode="wait">
        {!isRivalFound ? (
          /* ================================================================= */
          /* 1. SEARCHING STATE: Neo-Brutalist Central Card Container          */
          /* ================================================================= */
          <motion.div
            key="searching-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
            className="w-full bg-surface border-[3px] border-border rounded-3xl p-6 sm:p-8 shadow-[0_6px_0_#141827] flex flex-col items-center gap-6"
          >
            {/* ── Top Header Pill ── */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-muted border-[2px] border-border text-[11px] font-black uppercase tracking-wider text-text-secondary shadow-[0_1.5px_0_#141827]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Queue</span>
            </div>

            {/* ── User Avatar Badge (Bold Border, Solid Warm Yellow Accent) ── */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary border-[3px] border-border shadow-[0_4px_0_#141827] flex items-center justify-center overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.gamerTag}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-text-primary uppercase tracking-tight">
                    {currentUser.gamerTag.slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Live Status Pip */}
              <div
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-[2px] border-border shadow-[0_1px_0_#141827]"
                title="Active"
              />
            </div>

            {/* ── User Metadata Structured Inside Crisp Pill Tags ── */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
              {/* Gamer Tag Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border-[2px] border-border text-xs sm:text-sm font-black text-text-primary shadow-[0_2px_0_#141827]">
                <span>{currentUser.gamerTag}</span>
              </div>

              {/* ELO Rating Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary border-[2px] border-border text-xs font-black text-text-primary shadow-[0_2px_0_#141827]">
                <Sparkles size={13} className="text-text-primary stroke-[2.5]" />
                <span className="tabular-nums">{currentUser.elo} ELO</span>
              </div>

              {/* School Code Pill */}
              {currentUser.schoolCode && (
                <div
                  data-testid="user-school-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted border-[2px] border-border text-xs font-black text-text-primary shadow-[0_2px_0_#141827]"
                >
                  <Shield size={13} className="text-text-primary stroke-[2.5]" />
                  <span className="uppercase">{currentUser.schoolCode}</span>
                </div>
              )}
            </div>

            {/* ── Queue Status State Banner (Warm Yellow Theme + Bouncing Dots) ── */}
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full p-4 rounded-2xl bg-primary/20 border-[2px] border-border shadow-[0_3px_0_#141827] flex flex-col items-center gap-2.5 text-center"
            >
              {/* Clean Playful Bouncing Dots Indicator */}
              <div className="flex items-center gap-1.5 pt-0.5" aria-hidden="true">
                <motion.span
                  className="w-2.5 h-2.5 rounded-full bg-text-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="w-2.5 h-2.5 rounded-full bg-text-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                />
                <motion.span
                  className="w-2.5 h-2.5 rounded-full bg-text-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                />
              </div>

              <span className="text-xs sm:text-sm font-black text-text-primary tracking-tight">
                {statusText}
              </span>

              {/* Elapsed Timer & Matchmaking Type Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border-[2px] border-border text-[11px] font-black text-text-secondary shadow-[0_1.5px_0_#141827]">
                <Wifi size={12} className="text-emerald-600 stroke-[2.5]" />
                <span className="tabular-nums font-mono text-text-primary">
                  {formatElapsedDisplay(elapsedSeconds)}
                </span>
                <span className="opacity-40">•</span>
                <span>Tier Matchmaking</span>
              </div>
            </motion.div>

            {/* ── Action Controls: Cancel Search Neo-Brutalist Button ── */}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="w-full max-w-xs py-3 px-5 bg-surface hover:bg-surface-muted active:bg-surface-muted border-[2.5px] border-border rounded-2xl text-xs font-black uppercase tracking-wider text-text-primary shadow-[0_3px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isCancelling ? "Cancelling..." : "Cancel Search"}</span>
              </button>
            )}
          </motion.div>
        ) : (
          /* ================================================================= */
          /* 2. RIVAL_FOUND STATE: Neo-Brutalist Split-Screen VS Clash        */
          /* ================================================================= */
          <div
            key="clash-stage"
            className="relative w-full max-w-xl flex flex-col items-center justify-center z-20 min-h-[420px]"
          >
            {/* Center Flash Impact Layer */}
            <motion.div
              data-testid="clash-flash"
              className="absolute inset-0 bg-primary/30 pointer-events-none rounded-3xl z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              aria-hidden="true"
            />

            {/* Split Screen Cards Container */}
            <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* ── USER CARD (Slides in from Screen Left: -100% to 0) ── */}
              <motion.div
                data-testid="user-clash-card"
                className="w-full p-4 sm:p-5 rounded-2xl bg-surface border-[3px] border-border shadow-[0_5px_0_#141827] flex items-center gap-4 will-change-transform"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 26,
                  duration: 0.45,
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary border-[2.5px] border-border overflow-hidden flex items-center justify-center shadow-[0_2px_0_#141827]">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black text-text-primary uppercase">
                        {currentUser.gamerTag.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-secondary text-text-primary border-[1.5px] border-border font-black text-[9px] uppercase tracking-wider shadow-[0_1px_0_#141827]">
                    YOU
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Shield size={11} className="text-text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      {currentUser.schoolCode || "ACADEMY"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-text-primary truncate tracking-tight">
                    {currentUser.gamerTag}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary border-[1.5px] border-border text-text-primary text-[11px] font-black tabular-nums mt-1 shadow-[0_1px_0_#141827]">
                    <Sparkles size={10} className="text-text-primary stroke-[2.5]" />
                    <span>{currentUser.elo} ELO</span>
                  </div>
                </div>
              </motion.div>

              {/* ── OPPONENT CARD (Slides in from Screen Right: +100% to 0) ── */}
              <motion.div
                data-testid="opponent-clash-card"
                className="w-full p-4 sm:p-5 rounded-2xl bg-surface border-[3px] border-border shadow-[0_5px_0_#141827] flex items-center gap-4 flex-row-reverse md:flex-row will-change-transform"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 26,
                  duration: 0.45,
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary border-[2.5px] border-border overflow-hidden flex items-center justify-center shadow-[0_2px_0_#141827]">
                    {matchedOpponent?.avatarUrl ? (
                      <img
                        src={matchedOpponent.avatarUrl}
                        alt={matchedOpponent.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black text-text-primary uppercase">
                        {(matchedOpponent?.gamerTag || "Rival").slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-primary text-text-primary border-[1.5px] border-border font-black text-[9px] uppercase tracking-wider shadow-[0_1px_0_#141827]">
                    RIVAL
                  </span>
                </div>

                <div className="flex-1 min-w-0 text-right md:text-left">
                  <div className="flex items-center gap-1 mb-0.5 justify-end md:justify-start">
                    <Shield size={11} className="text-text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      {matchedOpponent?.schoolCode || "REGIONAL"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-text-primary truncate tracking-tight">
                    {matchedOpponent?.gamerTag || "Challenger"}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border-[1.5px] border-border text-text-primary text-[11px] font-black tabular-nums mt-1 shadow-[0_1px_0_#141827]">
                    <Swords size={10} className="text-text-primary stroke-[2.5]" />
                    <span>{matchedOpponent?.elo ?? 1000} ELO</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── CENTER FLASH "VS" EMBLEM (Bounce scale: 0 -> 1.2 -> 1.0) ── */}
            <motion.div
              data-testid="vs-emblem"
              className="absolute z-40 flex items-center justify-center"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1.0],
                rotate: [-20, 6, 0],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 0.55,
                times: [0, 0.7, 1],
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary border-[3px] border-border shadow-[0_4px_0_#141827]">
                <span className="font-black text-2xl sm:text-3xl italic tracking-wider text-text-primary select-none">
                  VS
                </span>
              </div>
            </motion.div>

            {/* Status cue below clash */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.25 }}
              className="mt-6 z-30 text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary border-[2px] border-border text-text-primary font-black text-xs uppercase tracking-wider shadow-[0_2px_0_#141827]">
                <Zap size={13} className="stroke-[3]" />
                Entering Arena...
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
