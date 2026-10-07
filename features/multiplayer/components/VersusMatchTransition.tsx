"use client";
// features/multiplayer/components/VersusMatchTransition.tsx

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Zap, Flame, Sparkles } from "lucide-react";
import {
  type CombatantProfile,
  type VersusMatchTransitionProps,
  VERSUS_ANIMATION_TIMINGS,
  getSchoolAbbreviation,
  getUserInitials,
  MOCK_PREMPEH_COLLEGE,
  MOCK_ACHIMOTA_SCHOOL,
  MOCK_VERSUS_MATCH,
} from "../utils/versus-transition";

export type { CombatantProfile, VersusMatchTransitionProps };
export { MOCK_PREMPEH_COLLEGE, MOCK_ACHIMOTA_SCHOOL, MOCK_VERSUS_MATCH };

/**
 * Resilient School Crest Component:
 * If crestUrl is null or fails to load, falls back to a sharp, rounded-xl box
 * tinted in the school's primary color with 3px black border displaying the
 * school's 3-letter abbreviation (e.g. "PMP", "MOT") in bold white text.
 */
export function SchoolCrestBadge({
  schoolName,
  schoolShortCode,
  schoolColor,
  crestUrl,
  size = "md",
}: {
  schoolName: string;
  schoolShortCode: string;
  schoolColor: string;
  crestUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl",
  }[size];

  // If a valid URL is provided and has not failed, render the image
  if (crestUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-xl border-[3px] border-black overflow-hidden bg-white shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0`}
        title={schoolName}
      >
        <img
          src={crestUrl}
          alt={`${schoolName} Crest`}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  const abbr = getSchoolAbbreviation(schoolShortCode);

  // Automatic Neo-brutalist 3-letter abbreviation fallback box
  return (
    <div
      className={`${sizeClasses} rounded-xl border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black text-white uppercase tracking-wider shrink-0 transition-transform select-none`}
      style={{ backgroundColor: schoolColor }}
      title={`${schoolName} (${abbr})`}
      data-testid="crest-fallback"
    >
      <span className="drop-shadow-[0_1.5px_0_rgba(0,0,0,0.8)]">
        {abbr}
      </span>
    </div>
  );
}

/**
 * Resilient Combatant Avatar:
 * Renders avatar image if available, else initials inside a bold neo-brutalist circle.
 */
function CombatantAvatar({
  username,
  avatarUrl,
  accentColor,
}: {
  username: string;
  avatarUrl?: string | null;
  accentColor: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3.5px] border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-white shrink-0">
        <img
          src={avatarUrl}
          alt={username}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const initials = getUserInitials(username);

  return (
    <div
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center font-black text-xl sm:text-2xl text-black shrink-0 select-none"
      style={{ backgroundColor: accentColor || "#F4D06F" }}
      data-testid="avatar-fallback"
    >
      {initials}
    </div>
  );
}

/**
 * 1v1 "Versus" Pre-Match Cinematic Transition Component
 * 
 * Snappy Animation Sequence:
 * - 0.0s - 0.4s: Left and Right panels slide in aggressively with spring overshoot.
 * - 0.4s - 0.7s: Center "VS" starburst slams down with a hard bounce.
 * - 0.7s - 2.2s: "READY... SET... CLASH!" countdown indicator pulses.
 * - 2.5s: onComplete callback triggered to seamlessly launch Question 1.
 */
export function VersusMatchTransition({
  player1,
  player2,
  subject = "CORE MATHEMATICS • SPEED ROUND",
  stakes = "+25 SCHOOL TURF PTS",
  onComplete,
  durationMs = VERSUS_ANIMATION_TIMINGS.totalDurationMs,
  className = "",
  autoStart = true,
}: VersusMatchTransitionProps) {
  // Countdown phase: null -> "READY" -> "SET" -> "CLASH"
  const [countdownState, setCountdownState] = useState<"READY" | "SET" | "CLASH" | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!autoStart) return;

    // Progress bar ticker (runs across total duration)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setProgressPercent(progress);
    }, 25);

    // Timeline Sequence
    // 0.7s: "READY"
    const tReady = setTimeout(() => {
      setCountdownState("READY");
    }, VERSUS_ANIMATION_TIMINGS.readyCountdownDelayMs);

    // 1.4s: "SET"
    const tSet = setTimeout(() => {
      setCountdownState("SET");
    }, VERSUS_ANIMATION_TIMINGS.setCountdownDelayMs);

    // 2.1s: "CLASH"
    const tClash = setTimeout(() => {
      setCountdownState("CLASH");
    }, VERSUS_ANIMATION_TIMINGS.clashCountdownDelayMs);

    // 2.5s: onComplete
    const tDone = setTimeout(() => {
      clearInterval(interval);
      setProgressPercent(100);
      handleComplete();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(tReady);
      clearTimeout(tSet);
      clearTimeout(tClash);
      clearTimeout(tDone);
    };
  }, [autoStart, durationMs, handleComplete]);

  return (
    <div
      role="region"
      aria-label="Pre-match versus transition"
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 select-none ${className}`}
    >
      {/* ── Outer Card: Warm Cream Canvas, 4px Solid Black Border, Punchy Drop Shadow ── */}
      <div className="relative w-full bg-[#F5F3EC] border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
        
        {/* ── Top Header Stakes Pill Banner ── */}
        <div className="w-full bg-[#141827] text-white px-4 py-2.5 sm:py-3 border-b-[4px] border-black flex flex-wrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4D06F] animate-ping" />
            <span className="px-2.5 py-0.5 rounded-md bg-[#F4D06F] text-black font-black text-[11px] sm:text-xs uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_#000]">
              LIVE WASSCE DUEL
            </span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-[#F5F3EC] uppercase hidden xs:inline">
              {subject}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400 text-black border-[2px] border-black text-[11px] sm:text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_#000]">
            <Flame size={14} className="fill-black stroke-black" />
            <span>STAKES: {stakes}</span>
          </div>
        </div>

        {/* ── Split Combat Arena Body ── */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-2 min-h-[380px] sm:min-h-[420px] overflow-hidden">
          
          {/* ================================================================= */}
          {/* LEFT PANEL: PLAYER 1 (Prempeh College)                            */}
          {/* ================================================================= */}
          <motion.div
            initial={{ x: "-110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.4,
            }}
            className="relative flex flex-col justify-between p-6 sm:p-8 bg-[#F5F3EC] border-b-[4px] md:border-b-0 md:border-r-[4px] border-black overflow-hidden group"
          >
            {/* School Color Tint Accent Panel */}
            <div
              className="absolute inset-0 opacity-12 pointer-events-none"
              style={{ backgroundColor: player1.schoolColor }}
            />
            {/* Top decorative badge bar */}
            <div
              className="absolute top-0 left-0 right-0 h-3 border-b-[2px] border-black"
              style={{ backgroundColor: player1.schoolColor }}
            />

            {/* Top Row: School Crest Badge & Region */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SchoolCrestBadge
                  schoolName={player1.schoolName}
                  schoolShortCode={player1.schoolShortCode}
                  schoolColor={player1.schoolColor}
                  crestUrl={player1.crestUrl}
                  size="md"
                />
                <div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#5C6470] block">
                    {player1.region || "Ashanti Region"}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-black leading-tight">
                    {player1.schoolName}
                  </h3>
                </div>
              </div>

              {/* Contender 1 Pill */}
              <span className="px-2.5 py-1 bg-white border-[2px] border-black text-[10px] font-black rounded-lg text-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                CONTENDER 1
              </span>
            </div>

            {/* Center Area: Player Avatar & Core Gamer Info */}
            <div className="relative z-10 my-4 flex items-center gap-4">
              <CombatantAvatar
                username={player1.username}
                avatarUrl={player1.avatarUrl}
                accentColor={player1.schoolAccentColor || "#F4D06F"}
              />

              <div className="flex flex-col gap-1">
                <span className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-1.5">
                  {player1.username}
                  <Sparkles size={16} className="text-amber-500 fill-amber-400" />
                </span>

                {/* ELO Rating Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-[2.5px] border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] w-fit">
                  <Trophy size={14} className="stroke-[2.5] text-amber-500 fill-amber-400" />
                  <span>{player1.elo.toLocaleString()} ELO</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Motto Banner */}
            <div className="relative z-10 pt-3 border-t-[2.5px] border-black/20 flex items-center justify-between text-xs font-bold text-black/80">
              <span className="italic font-extrabold text-[11px] sm:text-xs text-black/70">
                "{player1.motto || "Suban ne Nimdeε"}"
              </span>
              <span
                className="w-3 h-3 rounded-full border-[1.5px] border-black"
                style={{ backgroundColor: player1.schoolColor }}
                title={player1.schoolName}
              />
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* RIGHT PANEL: PLAYER 2 (Achimota School)                           */}
          {/* ================================================================= */}
          <motion.div
            initial={{ x: "110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.4,
              delay: 0.05,
            }}
            className="relative flex flex-col justify-between p-6 sm:p-8 bg-[#F5F3EC] overflow-hidden group"
          >
            {/* School Color Tint Accent Panel */}
            <div
              className="absolute inset-0 opacity-12 pointer-events-none"
              style={{ backgroundColor: player2.schoolColor }}
            />
            {/* Top decorative badge bar */}
            <div
              className="absolute top-0 left-0 right-0 h-3 border-b-[2px] border-black"
              style={{ backgroundColor: player2.schoolColor }}
            />

            {/* Top Row: Opponent School Crest & Region */}
            <div className="relative z-10 flex items-start justify-between gap-3 md:flex-row-reverse">
              <div className="flex items-center gap-3 md:flex-row-reverse md:text-right">
                <SchoolCrestBadge
                  schoolName={player2.schoolName}
                  schoolShortCode={player2.schoolShortCode}
                  schoolColor={player2.schoolColor}
                  crestUrl={player2.crestUrl}
                  size="md"
                />
                <div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#5C6470] block">
                    {player2.region || "Greater Accra"}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-black leading-tight">
                    {player2.schoolName}
                  </h3>
                </div>
              </div>

              {/* Contender 2 Pill */}
              <span className="px-2.5 py-1 bg-white border-[2px] border-black text-[10px] font-black rounded-lg text-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                CONTENDER 2
              </span>
            </div>

            {/* Center Area: Opponent Avatar & ELO */}
            <div className="relative z-10 my-4 flex items-center gap-4 md:flex-row-reverse md:text-right">
              <CombatantAvatar
                username={player2.username}
                avatarUrl={player2.avatarUrl}
                accentColor={player2.schoolAccentColor || "#93C5FD"}
              />

              <div className="flex flex-col gap-1 md:items-end">
                <span className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-1.5 md:flex-row-reverse">
                  {player2.username}
                  <Zap size={16} className="text-blue-600 fill-blue-500" />
                </span>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-[2.5px] border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] w-fit">
                  <Trophy size={14} className="stroke-[2.5] text-amber-500 fill-amber-400" />
                  <span>{player2.elo.toLocaleString()} ELO</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Opponent Motto */}
            <div className="relative z-10 pt-3 border-t-[2.5px] border-black/20 flex items-center justify-between text-xs font-bold text-black/80 md:flex-row-reverse">
              <span className="italic font-extrabold text-[11px] sm:text-xs text-black/70">
                "{player2.motto || "Ut Omnes Unum Sint"}"
              </span>
              <span
                className="w-3 h-3 rounded-full border-[1.5px] border-black"
                style={{ backgroundColor: player2.schoolColor }}
                title={player2.schoolName}
              />
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* CENTER ELEMENT: PUNCHY "VS" STARBURST / CIRCLE SLAM BADGE         */}
          {/* Slams down at 0.4s - 0.7s with a hard bounce                      */}
          {/* ================================================================= */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <motion.div
              initial={{ y: -160, scale: 2.2, opacity: 0, rotate: -25 }}
              animate={{ y: 0, scale: 1, opacity: 1, rotate: -5 }}
              transition={{
                delay: 0.4,
                duration: 0.3,
                type: "spring",
                bounce: 0.6,
                damping: 10,
              }}
              className="relative flex items-center justify-center pointer-events-auto"
            >
              {/* Starburst Spike Background (Neo-Brutalist 8-Point Polygon) */}
              <div className="absolute w-28 h-28 sm:w-32 sm:h-32 bg-[#F4D06F] border-[3.5px] border-black shadow-[5px_5px_0px_#000] rotate-45 rounded-2xl -z-10" />

              {/* Central Crisp Circular Core */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F4D06F] border-[4px] border-black shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-black leading-none drop-shadow-[1.5px_1.5px_0_#FFF]">
                  VS
                </span>
                <span className="text-[9px] font-black tracking-widest uppercase text-black/80 -mt-0.5">
                  ROUND 1
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Footer Countdown Indicator & Progress Bar (0.7s - 2.5s) ── */}
        <div className="relative w-full bg-white border-t-[4px] border-black p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          
          {/* Left info: Speed rules */}
          <div className="flex items-center gap-2 text-xs font-black text-black">
            <span className="w-7 h-7 rounded-lg bg-[#F4D06F] border-[2px] border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
              <Swords size={16} className="text-black" />
            </span>
            <span>FIRST TO ANSWER ACCURATELY WINS SPEED BONUS (+50)</span>
          </div>

          {/* Center / Right: Dynamic Pulsing Countdown Indicator */}
          <div className="flex items-center gap-3">
            {countdownState && (
              <motion.div
                key={countdownState}
                initial={{ scale: 0.8, opacity: 0, y: 4 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`px-4 py-1.5 rounded-xl border-[2.5px] border-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] flex items-center gap-2 ${
                  countdownState === "READY"
                    ? "bg-[#F4D06F] text-black"
                    : countdownState === "SET"
                    ? "bg-amber-400 text-black"
                    : "bg-emerald-400 text-black animate-pulse"
                }`}
                data-testid="countdown-indicator"
              >
                {countdownState === "CLASH" ? (
                  <>
                    <Zap size={15} className="fill-black stroke-black" />
                    <span>CLASH!</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                    <span>{countdownState}...</span>
                  </>
                )}
              </motion.div>
            )}

            {/* Quick Skip button for manual advance / accessibility */}
            <button
              type="button"
              onClick={handleComplete}
              className="px-3 py-1.5 bg-[#F5F3EC] hover:bg-[#F0EBE0] text-black border-[2px] border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              SKIP
            </button>
          </div>

          {/* Snappy Bottom Neon/Solid Progress Gauge */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#141827]/10">
            <div
              className="h-full bg-black transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
