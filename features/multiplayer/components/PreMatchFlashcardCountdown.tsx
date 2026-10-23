"use client";
// features/multiplayer/components/PreMatchFlashcardCountdown.tsx

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Timer, Zap, ChevronLeft, ChevronRight, Eye, Sparkles, Swords } from "lucide-react";
import type { MultiplayerFlashcard } from "../types";
import type { CombatantProfile } from "../utils/versus-transition";
import { CombatantAvatar, SchoolCrestBadge } from "./VersusMatchTransition";

export interface PreMatchFlashcardCountdownProps {
  countdown: number;
  flashcards?: MultiplayerFlashcard[];
  subjectName?: string;
  onReady?: () => void;
  player1?: CombatantProfile;
  player2?: CombatantProfile;
  stakes?: string;
}

// Fallback academic warm-up cards in case room questions had no generated flashcards
const DEFAULT_WARMUP_CARDS: MultiplayerFlashcard[] = [
  {
    id: "def-1",
    front: "Concord & Subject-Verb Agreement: Measurements of distance & time?",
    back: "Always take a singular verb when considered as an unbroken unit (e.g., 'Ten kilometers IS too far').",
    topic: "ENGLISH GRAMMAR",
  },
  {
    id: "def-2",
    front: "Mitochondria & Cellular Respiration ATP Synthesis?",
    back: "Mitochondria synthesize the majority of ATP through oxidative phosphorylation in aerobic respiration.",
    topic: "INTEGRATED SCIENCE",
  },
  {
    id: "def-3",
    front: "Electric Capacitance Definition & Units?",
    back: "Capacitance (C = Q/V) is the ratio of stored charge to potential difference, measured in Farads (F).",
    topic: "PHYSICS",
  },
];

export function PreMatchFlashcardCountdown({
  countdown,
  flashcards,
  subjectName,
  onReady,
  player1,
  player2,
  stakes = "+25 SCHOOL TURF PTS",
}: PreMatchFlashcardCountdownProps) {
  const cards = (flashcards && flashcards.length > 0) ? flashcards : DEFAULT_WARMUP_CARDS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation for card flip/advance
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFlip, handleNext, handlePrev]);

  // Urgency styling based on remaining countdown
  const isUrgent = countdown <= 3;
  const progressPercent = Math.max(0, Math.min(100, (countdown / 10) * 100));

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-300">
      {/* ── 1v1 Combatant Duel Matchup Banner ── */}
      {player1 && player2 && (
        <div className="w-full bg-[#F5F3EC] border-[3px] border-border rounded-2xl p-3 shadow-[0_4px_0_rgba(20,24,39,0.9)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b-2 border-border/20 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Swords size={13} className="text-primary stroke-[2.5]" />
              {subjectName ? `${subjectName.toUpperCase()} • 1v1 SPEED DUEL` : "1v1 SPEED DUEL"}
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary border-2 border-border text-text-primary shadow-[1px_1px_0_#141827]">
              {stakes}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Player 1 (You) */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CombatantAvatar
                username={player1.username}
                avatarUrl={player1.avatarUrl}
                accentColor={player1.schoolAccentColor || "#F4D06F"}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-text-primary truncate">
                    {player1.username}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white border border-border text-text-primary shrink-0">
                    YOU
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary truncate">
                  <SchoolCrestBadge
                    schoolName={player1.schoolName}
                    schoolShortCode={player1.schoolShortCode}
                    schoolColor={player1.schoolColor}
                    crestUrl={player1.crestUrl}
                    size="sm"
                  />
                  <span className="truncate">{player1.schoolName}</span>
                </div>
              </div>
            </div>

            {/* VS Pill */}
            <div className="flex items-center justify-center shrink-0 px-1">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary border-2 border-border font-black text-xs text-text-primary flex items-center justify-center shadow-[1.5px_1.5px_0_#141827]">
                VS
              </span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
              <div className="flex flex-col items-end min-w-0">
                <span className="text-xs sm:text-sm font-black text-text-primary truncate max-w-full">
                  {player2.username}
                </span>
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-text-secondary truncate max-w-full">
                  <span className="truncate">{player2.schoolName}</span>
                  <SchoolCrestBadge
                    schoolName={player2.schoolName}
                    schoolShortCode={player2.schoolShortCode}
                    schoolColor={player2.schoolColor}
                    crestUrl={player2.crestUrl}
                    size="sm"
                  />
                </div>
              </div>
              <CombatantAvatar
                username={player2.username}
                avatarUrl={player2.avatarUrl}
                accentColor={player2.schoolAccentColor || "#93C5FD"}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 10s Countdown Banner ── */}
      <div className="flex flex-col items-center gap-2 p-3.5 bg-surface border-[3px] border-border rounded-2xl shadow-[0_5px_0_rgba(20,24,39,0.9)]">
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Zap size={14} className="fill-primary text-text-primary" />
              Pre-Match Flashcard Warm-up
            </span>
          </div>

          {/* Urgent Countdown Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-[2px] border-border font-black text-xs transition-colors shadow-[0_2px_0_#141827] ${
              isUrgent
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-primary text-text-primary"
            }`}
          >
            <Timer size={14} className="stroke-[2.5]" />
            <span>ROUND 1 IN {countdown}s</span>
          </div>
        </div>

        {/* 10-Second Countdown Depleting Bar */}
        <div className="w-full h-2 rounded-full bg-surface-muted border-[2px] border-border overflow-hidden mt-1">
          <motion.div
            className={`h-full ${isUrgent ? "bg-rose-500" : "bg-primary"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "linear", duration: 0.8 }}
          />
        </div>
      </div>

      {/* ── 3D Interactive Flashcard ── */}
      <div
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Showing answer — tap to flip" : "Showing question — tap to reveal"}
        className="w-full relative cursor-pointer select-none perspective-[1200px] min-h-[260px] sm:min-h-[290px]"
      >
        <div
          className="w-full min-h-[260px] sm:min-h-[290px] relative transition-transform duration-500 rounded-2xl border-[3px] border-border bg-surface shadow-[0_6px_0_rgba(20,24,39,0.9)]"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — Concept Prompt */}
          <div
            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-2xl bg-surface"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-secondary truncate pr-2">
                {currentCard.topic || subjectName || "CORE CONCEPT"}
              </span>
              <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border-[2px] border-border bg-surface-muted text-text-secondary shrink-0">
                PROMPT
              </span>
            </div>

            <div className="my-auto py-2 text-center">
              <p className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                {currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-wider">
              <Eye size={13} strokeWidth={2.5} />
              Tap or Space to reveal rule
            </div>
          </div>

          {/* Back — Answer / Academic Rule */}
          <div
            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-2xl bg-surface overflow-y-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-secondary truncate pr-2">
                {currentCard.topic || subjectName || "CORE CONCEPT"}
              </span>
              <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border-[2px] border-border bg-primary text-text-primary shrink-0">
                ANSWER
              </span>
            </div>

            <div className="my-auto py-2 text-center">
              <p className="text-sm sm:text-base font-bold text-text-primary leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-wider">
              <Eye size={13} strokeWidth={2.5} />
              Tap to return to prompt
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={cards.length <= 1}
            className="p-2 border-[2px] border-border rounded-xl bg-surface hover:bg-bg-primary text-text-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 disabled:opacity-40 transition-all cursor-pointer"
            title="Previous card"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>

          <span className="text-xs font-black text-text-secondary">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={cards.length <= 1}
            className="p-2 border-[2px] border-border rounded-xl bg-surface hover:bg-bg-primary text-text-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 disabled:opacity-40 transition-all cursor-pointer"
            title="Next card"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFlip}
          className="px-3.5 py-1.5 border-[2px] border-border rounded-xl font-black text-xs text-text-primary bg-surface hover:bg-bg-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
        >
          {isFlipped ? "Show Prompt" : "Flip Answer"}
        </button>

        {onReady && (
          <button
            type="button"
            onClick={onReady}
            className="px-3.5 py-1.5 bg-secondary text-text-primary border-[2px] border-border rounded-xl font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={12} strokeWidth={2.5} />
            Ready!
          </button>
        )}
      </div>
    </div>
  );
}
