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
  MATCHMAKING_TIPS,
} from "../utils/matchmaking-arena";

export type { MatchmakingProps, MatchmakingState };

export const MatchmakingArena = React.memo(function MatchmakingArena({
  currentUser,
  matchedOpponent,
  elapsedSeconds,
  onReadyToStart,
  onCancel,
  isCancelling = false,
  subjectName = "ENGLISH LANGUAGE",
}: MatchmakingProps) {
  const [matchState, setMatchState] = useState<MatchmakingState>("SEARCHING");
  const [tipIndex, setTipIndex] = useState(0);

  // Rotating educational micro-copy tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MATCHMAKING_TIPS.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

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
    }, CLASH_ANIMATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [matchedOpponent, onReadyToStart]);

  const isRivalFound = matchState === "RIVAL_FOUND" || matchState === "TRANSITION_TO_MATCH";
  const statusText = getMatchmakingStatusText(elapsedSeconds);

  // Compute initials fallback (e.g. "SC")
  const initials = currentUser.gamerTag
    ? currentUser.gamerTag.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "SC"
    : "SC";

  return (
    <div
      role="region"
      aria-label="Matchmaking arena"
      className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center p-2 select-none"
    >
      <AnimatePresence mode="wait">
        {!isRivalFound ? (
          /* ================================================================= */
          /* 1. SEARCHING STATE: Tactile Neo-Brutalist Card Container          */
          /* ================================================================= */
          <motion.div
            key="searching-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
            className="w-full bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] overflow-hidden flex flex-col items-center"
          >
            {/* ── 1. Top Header Integration: Locked directly into card header ── */}
            <div className="w-full bg-[#F5F3EC] px-4 sm:px-6 py-3 border-b-[2.5px] border-black flex items-center justify-between gap-2.5 flex-wrap">
              {/* Subject & Duel Type Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4D06F] border-[2px] border-black text-[11px] sm:text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black/40" />
                <span>
                  {subjectName ? `${subjectName.toUpperCase()} • RANKED DUEL` : "ENGLISH LANGUAGE • RANKED DUEL"}
                </span>
              </div>

              {/* Live Queue Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-[2px] border-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>LIVE QUEUE</span>
              </div>
            </div>

            {/* ── Card Body Content ── */}
            <div className="w-full p-6 sm:p-8 flex flex-col items-center gap-6">
              
              {/* ── 2. Primary Avatar & Identity Row ── */}
              <div className="relative flex items-center justify-center">
                {/* Circular yellow avatar container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#F4D06F] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.gamerTag}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight select-none">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Green Online Dot */}
                <div
                  className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-400 border-[2px] border-black shadow-[1.5px_1.5px_0px_#000]"
                  title="Online"
                />
              </div>

              {/* Horizontal Metadata Pills with tactile hover feedback & matched padding/borders */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
                {/* Gamer Tag Pill */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border-[2px] border-black text-xs sm:text-sm font-black text-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#000] transition-all cursor-default select-none">
                  <span>{currentUser.gamerTag}</span>
                </div>

                {/* ELO Rating Pill */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4D06F] border-[2px] border-black text-xs sm:text-sm font-black text-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#000] transition-all cursor-default select-none">
                  <Sparkles size={13} className="text-black stroke-[2.5]" />
                  <span className="tabular-nums">{currentUser.elo} ELO</span>
                </div>

                {/* School Code Pill */}
                {currentUser.schoolCode && (
                  <div
                    data-testid="user-school-badge"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border-[2px] border-black text-xs sm:text-sm font-black text-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#000] transition-all cursor-default select-none"
                  >
                    <Shield size={13} className="text-black stroke-[2.5]" />
                    <span className="uppercase">{currentUser.schoolCode}</span>
                  </div>
                )}
              </div>

              {/* ── 3. Dynamic Waiting State & Perceived Latency Container ── */}
              <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#F5F3EC] border-[2px] border-black shadow-[3px_3px_0px_#000] flex flex-col items-center gap-3 text-center">
                
                {/* Animated Bouncing Dots Indicator */}
                <div className="flex items-center gap-1.5 pt-0.5" aria-hidden="true">
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-black"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-black"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-black"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                  />
                </div>

                {/* Dynamic Status Text */}
                <motion.span
                  key={statusText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs sm:text-sm font-black text-black tracking-tight"
                >
                  {statusText}
                </motion.span>

                {/* Live Timer Pill ("00:00 • Tier Matchmaking") */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-[2px] border-black text-[11px] sm:text-xs font-black text-black shadow-[2px_2px_0px_#000]">
                  <Wifi size={13} className="text-emerald-600 stroke-[2.5]" />
                  <span className="tabular-nums font-mono">
                    {formatElapsedDisplay(elapsedSeconds)}
                  </span>
                  <span className="opacity-40">•</span>
                  <span>Tier Matchmaking</span>
                </div>

                {/* Rotating Micro-Copy Carousel (Fades in educational tips every 3s) */}
                <div className="min-h-[26px] flex items-center justify-center px-2 pt-1">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={tipIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="text-[11px] sm:text-xs font-bold text-black/75 italic tracking-tight"
                    >
                      {MATCHMAKING_TIPS[tipIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── 4. Action Button Enhancement ("CANCEL SEARCH") ── */}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="w-full max-w-xs py-3 px-6 bg-white hover:bg-[#F5F3EC] border-[2.5px] border-black rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
                  data-testid="cancel-search-button"
                >
                  <span>{isCancelling ? "CANCELLING..." : "CANCEL SEARCH"}</span>
                </button>
              )}
            </div>
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
              className="absolute inset-0 bg-[#F4D06F]/40 pointer-events-none rounded-3xl z-30"
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
                className="w-full p-4 sm:p-5 rounded-2xl bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center gap-4 will-change-transform"
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
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F3EC] border-[2px] border-black overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black text-black uppercase">
                        {initials}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-[#F4D06F] text-black border-[1.5px] border-black font-black text-[9px] uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                    YOU
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Shield size={11} className="text-black/70" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                      {currentUser.schoolCode || "ACADEMY"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-black truncate tracking-tight">
                    {currentUser.gamerTag}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4D06F] border-[1.5px] border-black text-black text-[11px] font-black tabular-nums mt-1 shadow-[1px_1px_0px_#000]">
                    <Sparkles size={10} className="text-black stroke-[2.5]" />
                    <span>{currentUser.elo} ELO</span>
                  </div>
                </div>
              </motion.div>

              {/* ── OPPONENT CARD (Slides in from Screen Right: +100% to 0) ── */}
              <motion.div
                data-testid="opponent-clash-card"
                className="w-full p-4 sm:p-5 rounded-2xl bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center gap-4 flex-row-reverse md:flex-row will-change-transform"
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
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F4D06F] border-[2px] border-black overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    {matchedOpponent?.avatarUrl ? (
                      <img
                        src={matchedOpponent.avatarUrl}
                        alt={matchedOpponent.gamerTag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black text-black uppercase">
                        {(matchedOpponent?.gamerTag || "Rival").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-[#F4D06F] text-black border-[1.5px] border-black font-black text-[9px] uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                    RIVAL
                  </span>
                </div>

                <div className="flex-1 min-w-0 text-right md:text-left">
                  <div className="flex items-center gap-1 mb-0.5 justify-end md:justify-start">
                    <Shield size={11} className="text-black/70" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                      {matchedOpponent?.schoolCode || "REGIONAL"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-black truncate tracking-tight">
                    {matchedOpponent?.gamerTag || "Challenger"}
                  </h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F3EC] border-[1.5px] border-black text-black text-[11px] font-black tabular-nums mt-1 shadow-[1px_1px_0px_#000]">
                    <Swords size={10} className="text-black stroke-[2.5]" />
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
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F4D06F] border-[2.5px] border-black shadow-[4px_4px_0px_#000]">
                <span className="font-black text-2xl sm:text-3xl italic tracking-wider text-black select-none">
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
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4D06F] border-[2px] border-black text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
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
