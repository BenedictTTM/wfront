"use client";
// features/multiplayer/components/VersusMatchTransition.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import {
  type CombatantProfile,
  type VersusMatchTransitionProps,
  getSchoolAbbreviation,
  getUserInitials,
  MOCK_ST_THOMAS_AQUINAS,
  MOCK_GHOST_SCHOLAR,
} from "../utils/versus-transition";

export type { CombatantProfile, VersusMatchTransitionProps };
export {
  VERSUS_ANIMATION_TIMINGS,
  MOCK_ST_THOMAS_AQUINAS,
  MOCK_GHOST_SCHOLAR,
  SAMPLE_VERSUS_MATCH,
  MOCK_PREMPEH_COLLEGE,
  MOCK_ACHIMOTA_SCHOOL,
  MOCK_VERSUS_MATCH,
} from "../utils/versus-transition";

/**
 * Resilient School Crest Component:
 * Displays school crest image if valid, or falls back to a neo-brutalist badge
 * in the school's primary color with 3px solid black border and bold abbreviation.
 */
export function SchoolCrestBadge({
  schoolName,
  schoolShortCode,
  schoolColor = "#055B38",
  crestUrl,
  size = "md",
}: {
  schoolName: string;
  schoolShortCode: string;
  schoolColor?: string;
  crestUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);

  // Known fallback crest catalog for immediate zero-latency resolution
  const getKnownCrestUrl = (name: string, code: string): string | null => {
    const n = (name || "").toLowerCase();
    const c = (code || "").toUpperCase();
    if (n.includes("aquinas") || c === "AQUINAS" || c === "AQU") {
      return "https://res.cloudinary.com/dsriwu6yn/image/upload/v1791470415/crests/st-thomas-aquinas-senior-high-school.jpg";
    }
    if (n.includes("abakrampa") || c.startsWith("ASHS")) {
      return "https://school-crests.s3.auto.amazonaws.com/crests/abakrampa-senior-high-technical-school.webp";
    }
    return null;
  };

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    crestUrl || getKnownCrestUrl(schoolName, schoolShortCode)
  );

  useEffect(() => {
    setImgError(false);
    if (crestUrl) {
      setResolvedUrl(crestUrl);
    } else {
      const known = getKnownCrestUrl(schoolName, schoolShortCode);
      if (known) {
        setResolvedUrl(known);
      } else if (
        schoolName &&
        schoolName !== "Independent Scholar" &&
        schoolName !== "WASSCE Scholar League"
      ) {
        fetch(`/api/schools?search=${encodeURIComponent(schoolName)}&limit=1`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const found = data?.schools?.[0];
            if (found?.crestUrl) {
              setResolvedUrl(found.crestUrl);
            }
          })
          .catch(() => {});
      }
    }
  }, [crestUrl, schoolName, schoolShortCode]);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl",
  }[size];

  const activeUrl = crestUrl || resolvedUrl;

  if (activeUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-full border-[3px] border-black overflow-hidden bg-white shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0 p-1`}
        title={schoolName}
      >
        <img
          src={activeUrl}
          alt={`${schoolName} Crest`}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const abbr = getSchoolAbbreviation(schoolShortCode);

  return (
    <div
      className={`${sizeClasses} rounded-full border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black text-white uppercase tracking-wider shrink-0 transition-transform select-none`}
      style={{ backgroundColor: schoolColor }}
      title={`${schoolName} (${abbr})`}
      data-testid="crest-fallback"
    >
      <span className="drop-shadow-[0_1.5px_0_rgba(0,0,0,0.8)]">{abbr}</span>
    </div>
  );
}

/**
 * Resilient Combatant Avatar:
 * Renders avatar image if available, else bold initials inside a neo-brutalist circle.
 */
export function CombatantAvatar({
  username,
  avatarUrl,
  accentColor = "#F4D06F",
}: {
  username: string;
  avatarUrl?: string | null;
  accentColor?: string;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-white shrink-0">
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
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center font-black text-xl sm:text-2xl text-black shrink-0 select-none"
      style={{ backgroundColor: accentColor }}
      data-testid="avatar-fallback"
    >
      {initials}
    </div>
  );
}

/**
 * Balanced, Symmetrical Neo-Brutalist 1v1 "Live WASSCE Duel" Pre-Match Screen.
 */
export function VersusMatchTransition({
  player1 = MOCK_ST_THOMAS_AQUINAS,
  player2 = MOCK_GHOST_SCHOLAR,
  subject,
  stakes = "+25 SCHOOL TURF PTS",
  onComplete,
  onCountdownComplete,
  durationMs = 3000,
  className = "",
  autoStart = true,
}: VersusMatchTransitionProps) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(1, Math.ceil(durationMs / 1000)));
  const [progressPercent, setProgressPercent] = useState(0);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (onCountdownComplete) {
      onCountdownComplete();
    }
    if (onComplete) {
      onComplete();
    }
  }, [onCountdownComplete, onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setSecondsLeft(Math.max(1, Math.ceil(durationMs / 1000)));
    setProgressPercent(0);

    if (!autoStart) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setProgressPercent(progress);

      const remainingSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setSecondsLeft(remainingSec);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        handleComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [autoStart, durationMs, handleComplete]);

  // Clean stakes text without duplicate fire emojis
  const cleanStakes = stakes.replace(/^🔥\s*/, "");

  return (
    <div
      role="region"
      aria-label="Live WASSCE Duel Pre-Match Screen"
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 select-none ${className}`}
    >
      {/* ── Outer Neo-Brutalist Card ── */}
      <div className="relative w-full bg-[#F5F3EC] border-[3px] sm:border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
        
        {/* ── 1. Top Header Bar ── */}
        <div className="w-full bg-[#F5F3EC] px-4 sm:px-6 py-3 border-b-2 sm:border-b-[3px] border-black flex items-center justify-between gap-3 flex-wrap z-20">
          {/* Left Tag: Yellow pill badge with 2px black border reading "LIVE WASSCE DUEL" */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#F4D06F] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000]">
              LIVE WASSCE DUEL
            </span>
            {subject && (
              <span className="text-xs font-black uppercase tracking-tight text-black/70 hidden md:inline">
                {subject}
              </span>
            )}
          </div>

          {/* Right Tag: Emerald green pill badge with 2px black border reading "🔥 STAKES: +25 SCHOOL TURF PTS" */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#10B981] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000]">
            🔥 STAKES: {cleanStakes}
          </div>
        </div>

        {/* ── 2. Main Split Versus Arena (Perfect Symmetry) ── */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-2 min-h-[360px] sm:min-h-[380px] bg-[#F5F3EC]">
          
          {/* Vertical 2px black divider between left and right columns (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-black -translate-x-1/2 z-10" />

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: "YOU" (St. Thomas Aquinas SHS / User Profile)        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex flex-col justify-between p-5 sm:p-6 md:p-8 border-b-2 border-black md:border-b-0 overflow-hidden"
          >
            {/* Subtle school tint accent */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundColor: player1.schoolColor || "#055B38" }}
            />

            {/* Top Sub-Header & School Meta */}
            <div className="relative z-10 flex flex-col gap-3">
              {/* Top Sub-Header: Clean pill tag "YOU" */}
              <div className="flex items-center justify-start">
                <span className="px-3 py-0.5 rounded-full bg-white border-2 border-black text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  YOU
                </span>
              </div>

              {/* School Meta: Crest (left) followed by school name and region */}
              <div className="flex items-center gap-3">
                <SchoolCrestBadge
                  schoolName={player1.schoolName}
                  schoolShortCode={player1.schoolShortCode}
                  schoolColor={player1.schoolColor}
                  crestUrl={player1.crestUrl}
                  size="md"
                />
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-black text-black leading-tight">
                    {player1.schoolName}
                  </h3>
                  {player1.region ? (
                    <span className="text-[11px] font-bold text-black/70 uppercase tracking-wide">
                      {player1.region}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Competitor Profile: Centered flanking the Center VS Badge */}
            <div className="relative z-10 my-6 sm:my-8 flex items-center justify-end gap-3 sm:gap-4 md:pr-12">
              <div className="flex flex-col items-end gap-1.5 text-right">
                <span className="text-lg sm:text-xl font-black text-black tracking-tight">
                  {player1.username}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000]">
                  <Trophy size={13} className="text-amber-500 fill-amber-400 stroke-[2.5]" />
                  <span>{player1.elo !== undefined ? `${player1.elo.toLocaleString()} ELO` : "1,000 ELO"}</span>
                </div>
              </div>

              <CombatantAvatar
                username={player1.username}
                avatarUrl={player1.avatarUrl}
                accentColor={player1.schoolAccentColor || "#F4D06F"}
              />
            </div>

            {/* Bottom Motto */}
            <div className="relative z-10 pt-3 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold text-black/80">
              <span className="italic font-extrabold text-[11px] sm:text-xs text-black/75 truncate pr-2">
                &ldquo;{player1.motto || "Veritas Liberat (The Truth Sets Us Free)"}&rdquo;
              </span>
              <span
                className="w-3 h-3 rounded-full border border-black shrink-0"
                style={{ backgroundColor: player1.schoolColor || "#055B38" }}
                title={player1.schoolName}
              />
            </div>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: "OPPONENT" (Achimota / Ghost Scholar - Mirrored)   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex flex-col justify-between p-5 sm:p-6 md:p-8 overflow-hidden"
          >
            {/* Subtle school tint accent */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundColor: player2.schoolColor || "#172554" }}
            />

            {/* Top Sub-Header & School Meta (Mirrored) */}
            <div className="relative z-10 flex flex-col gap-3">
              {/* Top Sub-Header: Clean pill tag "OPPONENT" */}
              <div className="flex items-center justify-end">
                <span className="px-3 py-0.5 rounded-full bg-white border-2 border-black text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  OPPONENT
                </span>
              </div>

              {/* School Meta (Mirrored): Opponent Crest on right, Name & Region on left */}
              <div className="flex items-center justify-end gap-3 text-right">
                <div className="flex flex-col items-end">
                  <h3 className="text-base sm:text-lg font-black text-black leading-tight">
                    {player2.schoolName}
                  </h3>
                  {player2.region ? (
                    <span className="text-[11px] font-bold text-black/70 uppercase tracking-wide">
                      {player2.region}
                    </span>
                  ) : null}
                </div>
                <SchoolCrestBadge
                  schoolName={player2.schoolName}
                  schoolShortCode={player2.schoolShortCode}
                  schoolColor={player2.schoolColor}
                  crestUrl={player2.crestUrl}
                  size="md"
                />
              </div>
            </div>

            {/* Competitor Profile: Centered flanking the Center VS Badge (Mirrored) */}
            <div className="relative z-10 my-6 sm:my-8 flex items-center justify-start gap-3 sm:gap-4 md:pl-12">
              <CombatantAvatar
                username={player2.username}
                avatarUrl={player2.avatarUrl}
                accentColor={player2.schoolAccentColor || "#93C5FD"}
              />

              <div className="flex flex-col items-start gap-1.5 text-left">
                <span className="text-lg sm:text-xl font-black text-black tracking-tight">
                  {player2.username}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000]">
                  <Trophy size={13} className="text-amber-500 fill-amber-400 stroke-[2.5]" />
                  <span>{player2.elo !== undefined ? `${player2.elo.toLocaleString()} ELO` : "1,000 ELO"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Motto / League Subtitle to preserve vertical balance */}
            <div className="relative z-10 pt-3 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold text-black/80 flex-row-reverse">
              <span className="italic font-extrabold text-[11px] sm:text-xs text-black/75 truncate pl-2">
                &ldquo;{player2.motto || "Ut Omnes Unum Sint (That All May Be One)"}&rdquo;
              </span>
              <span
                className="w-3 h-3 rounded-full border border-black shrink-0"
                style={{ backgroundColor: player2.schoolColor || "#172554" }}
                title={player2.schoolName}
              />
            </div>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* CENTERPIECE "VS" BADGE: Tilted diamond positioned dead-center    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.1,
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F4D06F] border-[3px] border-black shadow-[4px_4px_0px_#000] rounded-xl flex items-center justify-center pointer-events-auto select-none"
            >
              {/* Inside text un-rotated (-rotate-45) */}
              <div className="-rotate-45 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black italic text-black leading-none tracking-tighter">
                  VS
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-black/90 tracking-widest mt-0.5">
                  ROUND 1
                </span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ── 3. Bottom Action & Countdown Bar ── */}
        <div className="relative w-full bg-white border-t-[3px] border-black p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          
          {/* Left: Icon badge and bonus text */}
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F4D06F] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
              <Zap size={16} className="fill-black stroke-black" />
            </span>
            <span className="text-xs sm:text-sm font-black text-black tracking-tight">
              ⚡ First accurate answer wins Speed Bonus (+50)
            </span>
          </div>

          {/* Right: Primary Yellow Auto-Start Countdown Button & Secondary Ghost SKIP Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Primary Yellow Button: STARTING (3s)... */}
            <button
              type="button"
              onClick={handleComplete}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#F4D06F] hover:bg-[#ebd060] text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2"
              data-testid="countdown-button"
            >
              <span>
                {secondsLeft > 0 ? `STARTING (${secondsLeft}s)...` : "STARTING..."}
              </span>
            </button>

            {/* Secondary Ghost Button: SKIP */}
            <button
              type="button"
              onClick={handleComplete}
              className="px-4 py-2 bg-white hover:bg-[#F5F3EC] text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
              data-testid="skip-button"
            >
              SKIP
            </button>
          </div>

          {/* Snappy Bottom Neon/Solid Progress Gauge */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
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
