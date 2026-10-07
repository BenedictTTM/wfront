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
      className="relative w-full max-w-4xl mx-auto min-h-[540px] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* ── Atmospheric Radar Glow ── */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-amber-500/10 via-emerald-500/5 to-cyan-500/10 blur-3xl opacity-70 animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {!isRivalFound ? (
          /* ================================================================= */
          /* 1. SEARCHING STATE: Radar Pulse & Tier Search                     */
          /* ================================================================= */
          <motion.div
            key="searching-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
            className="flex flex-col items-center justify-center gap-8 w-full z-10"
          >
            {/* ── Center Radar & Avatar Anchor ── */}
            <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64">
              {/* 3 Concentric Expanding Radar Rings (scale: 1 to 2.5, opacity: 0.6 to 0, 2.5s duration, staggered by 0.8s) */}
              {[0, 1, 2].map((ringIndex) => (
                <motion.div
                  key={ringIndex}
                  data-testid={`radar-ring-${ringIndex}`}
                  className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-amber-400/60 pointer-events-none will-change-transform"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: ringIndex * 0.8,
                  }}
                  aria-hidden="true"
                />
              ))}

              {/* Sweeping Radar Scanner Line */}
              <div
                className="absolute inset-0 rounded-full border border-amber-400/20 overflow-hidden pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.25)_0deg,transparent_60deg,transparent_360deg)] animate-[spin_4s_linear_infinite]" />
              </div>

              {/* Center User Avatar inside circular frame */}
              <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 border-[3.5px] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35),0_6px_0_rgba(15,23,42,0.95)] flex items-center justify-center overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.gamerTag}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-tighter">
                      {currentUser.gamerTag.slice(0, 2)}
                    </span>
                  </div>
                )}

                {/* Live Searching Beacon dot */}
                <div
                  className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm animate-ping"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"
                  title="Radar Active"
                />
              </div>

              {/* School Badge Anchored to Center Frame */}
              <div
                data-testid="user-school-badge"
                className="absolute -bottom-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border-[2px] border-amber-400 text-amber-300 shadow-[0_3px_0_rgba(0,0,0,0.8)]"
              >
                <Shield size={13} className="text-amber-400 stroke-[2.5]" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {currentUser.schoolCode || "ACADEMY"}
                </span>
              </div>
            </div>

            {/* ── Identity & Real-Time Search Status ── */}
            <div className="flex flex-col items-center gap-3 text-center max-w-md w-full px-2">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                  {currentUser.gamerTag}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] tabular-nums">
                  {currentUser.elo} ELO
                </span>
              </div>

              {/* Dynamic Status Text (0-4s / 5-8s / >8s) */}
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner"
              >
                <Zap size={14} className="text-amber-400 animate-bounce shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
                  {statusText}
                </span>
              </motion.div>

              {/* Timer & Network indicator */}
              <div className="flex items-center gap-2.5 text-xs text-slate-400 font-semibold mt-1">
                <Wifi size={13} className="text-emerald-400 animate-pulse stroke-[2.5]" />
                <span className="tabular-nums font-mono text-slate-300">
                  {formatElapsedDisplay(elapsedSeconds)}
                </span>
                <span>•</span>
                <span>Tier Matchmaking</span>
              </div>
            </div>

            {/* ── Cancel Queue Button ── */}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="mt-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border-[2px] border-slate-700 text-slate-300 hover:text-white text-xs font-black tracking-wider uppercase transition-all shadow-[0_2px_0_rgba(0,0,0,0.6)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Search"}
              </button>
            )}
          </motion.div>
        ) : (
          /* ================================================================= */
          /* 2. RIVAL_FOUND STATE: High-Stakes 800ms Split-Screen VS Clash     */
          /* ================================================================= */
          <div
            key="clash-stage"
            className="relative w-full max-w-3xl flex flex-col items-center justify-center z-20 min-h-[460px]"
          >
            {/* Center Flash Impact Layer */}
            <motion.div
              data-testid="clash-flash"
              className="absolute inset-0 bg-gradient-to-r from-amber-400/30 via-white/40 to-rose-500/30 pointer-events-none rounded-3xl blur-xl z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              aria-hidden="true"
            />

            {/* Split Screen Container */}
            <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
              {/* ── USER CARD (Slides in from Screen Left: -100% to 0) ── */}
              <motion.div
                data-testid="user-clash-card"
                className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border-[2.5px] border-emerald-500 shadow-[0_8px_25px_rgba(16,185,129,0.25),0_6px_0_#064e3b] flex items-center gap-4 sm:gap-5 will-change-transform"
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-[2.5px] border-emerald-400 overflow-hidden flex items-center justify-center shadow-md">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 uppercase">
                        {currentUser.gamerTag.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                    YOU
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      {currentUser.schoolCode || "ACADEMY"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
                    {currentUser.gamerTag}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-black tabular-nums mt-1">
                    <Sparkles size={11} className="text-emerald-400" />
                    <span>{currentUser.elo} ELO</span>
                  </div>
                </div>
              </motion.div>

              {/* ── OPPONENT CARD (Slides in from Screen Right: +100% to 0) ── */}
              <motion.div
                data-testid="opponent-clash-card"
                className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-bl from-slate-900 via-slate-900 to-rose-950/70 border-[2.5px] border-rose-500 shadow-[0_8px_25px_rgba(244,63,94,0.25),0_6px_0_#4c0519] flex items-center gap-4 sm:gap-5 flex-row-reverse md:flex-row will-change-transform"
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-[2.5px] border-rose-400 overflow-hidden flex items-center justify-center shadow-md">
                    {matchedOpponent?.avatarUrl ? (
                      <img
                        src={matchedOpponent.avatarUrl}
                        alt={matchedOpponent.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-black text-rose-400 uppercase">
                        {(matchedOpponent?.gamerTag || "Rival").slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider shadow">
                    RIVAL
                  </span>
                </div>

                <div className="flex-1 min-w-0 text-right md:text-left">
                  <div className="flex items-center gap-1.5 mb-1 justify-end md:justify-start">
                    <Shield size={12} className="text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                      {matchedOpponent?.schoolCode || "REGIONAL"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
                    {matchedOpponent?.gamerTag || "Challenger"}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-black tabular-nums mt-1">
                    <Swords size={11} className="text-rose-400" />
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
              <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 border-[3.5px] border-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.8),0_6px_0_#1e293b]">
                <span className="font-black text-2xl sm:text-3xl italic tracking-wider text-slate-950 select-none drop-shadow">
                  VS
                </span>

                {/* Energy corner spark effects */}
                <div
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#ffffff] animate-ping"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a] animate-ping"
                  aria-hidden="true"
                />
              </div>
            </motion.div>

            {/* Status cue below clash */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.25 }}
              className="mt-8 z-30 text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-widest animate-pulse">
                <Zap size={14} className="stroke-[3]" />
                Entering Arena...
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
