"use client";
// features/multiplayer/components/PostMatchSummary.tsx

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Swords,
  Scale,
  Shield,
  Target,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  PostMatchData,
  RematchState,
  getHeroHeader,
  getTierFromElo,
  getTierLadderDistance,
  formatAcademicRule,
} from "../utils/post-match";

export interface PostMatchSummaryProps {
  data: PostMatchData;
  onLaunchRematch: (newMatchId: string) => void;
  onFindNewOpponent: () => void;
  onEmitRematchRequest?: (matchId: string) => void;
  onBookmarkQuestion?: (questionId: string) => void;
  rematchAcceptedMatchId?: string | null;
}

/**
 * Production-Ready Post-Match Summary Screen
 * Fixes action-loop friction with a persistent above-the-fold Action Dock,
 * corrects Elo arrows & dynamic ladder distance, enhances answer review contrast,
 * and tightens vertical padding by 20% on the hero card.
 */
export const PostMatchSummary = React.memo(function PostMatchSummary({
  data,
  onLaunchRematch,
  onFindNewOpponent,
  onEmitRematchRequest,
  onBookmarkQuestion,
  rematchAcceptedMatchId = null,
}: PostMatchSummaryProps) {
  const { result, player, opponent, subject, schoolTurfContribution, missedQuestions } = data;

  // ── Rematch Handshake State Machine ──
  const [rematchState, setRematchState] = useState<RematchState>("IDLE");
  const [countdown, setCountdown] = useState(5);

  // ── Missed Questions Accordion & Bookmarking State ──
  const [isAccordionOpen, setIsAccordionOpen] = useState(missedQuestions.length > 0);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<string>>(new Set());

  // Handle external acceptance of rematch
  useEffect(() => {
    if (rematchAcceptedMatchId) {
      setRematchState("ACCEPTED");
      onLaunchRematch(rematchAcceptedMatchId);
    }
  }, [rematchAcceptedMatchId, onLaunchRematch]);

  // Countdown timer for WAITING state (5s timeout)
  useEffect(() => {
    if (rematchState !== "WAITING") return;

    if (countdown <= 0) {
      setRematchState("OPPONENT_LEFT");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [rematchState, countdown]);

  const handleRequestRematch = () => {
    if (rematchState !== "IDLE") return;
    setRematchState("WAITING");
    setCountdown(5);
    onEmitRematchRequest?.(data.matchId);
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarkedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    onBookmarkQuestion?.(questionId);
  };

  const heroMeta = getHeroHeader(result, player.eloDelta);
  const tierMeta = getTierFromElo(player.newElo);
  const ladderDistance = getTierLadderDistance(player.newElo);

  return (
    <div
      role="region"
      aria-label="Match settlement summary"
      className="w-full max-w-2xl mx-auto flex flex-col gap-4 sm:gap-5 py-2 px-3 sm:px-6 select-none animate-in fade-in duration-300"
    >
      {/* =================================================================== */}
      {/* 1. HERO HEADER: Respectful Framing & Tightened Vertical Padding    */}
      {/* =================================================================== */}
      <div
        data-testid="post-match-hero"
        className={`w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl sm:rounded-3xl border-[2.5px] shadow-[0_5px_0_rgba(15,23,42,0.95)] flex flex-col items-center text-center gap-2 sm:gap-2.5 ${heroMeta.badgeBgClass}`}
      >
        <div className="flex items-center justify-center">
          {result === "VICTORY" ? (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 border-[2px] border-amber-400 flex items-center justify-center text-amber-400 shadow-sm">
              <Trophy size={24} className="stroke-[2.5]" />
            </div>
          ) : result === "DEFEAT" ? (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border-[2px] border-slate-600 flex items-center justify-center text-slate-300 shadow-sm">
              <Swords size={24} className="stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border-[2px] border-slate-600 flex items-center justify-center text-slate-300 shadow-sm">
              <Scale size={24} className="stroke-[2.5]" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-tight">
            {heroMeta.title}
          </h1>
          <p className="text-xs text-slate-300 font-bold mt-0.5">
            {player.finalScore} PTS <span className="opacity-60">•</span> Opponent: {opponent.finalScore} PTS
          </p>
        </div>

        {/* ELO Delta indicator with directional arrow (↘ for loss, ↗ for win) */}
        <div
          data-testid="hero-elo-delta"
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 shadow-inner"
        >
          {player.eloDelta < 0 ? (
            <TrendingDown size={14} className="text-slate-400" />
          ) : player.eloDelta > 0 ? (
            <TrendingUp size={14} className={heroMeta.eloDeltaColorClass} />
          ) : (
            <TrendingUp size={14} className="text-slate-300" />
          )}
          <span className={`text-xs sm:text-sm font-black tabular-nums tracking-wide ${heroMeta.eloDeltaColorClass}`}>
            {player.eloDelta < 0 ? `↘ ${heroMeta.eloDeltaText} ELO` : player.eloDelta > 0 ? `↗ ${heroMeta.eloDeltaText} ELO` : `0 ELO`}
          </span>
          <span className="text-[11px] text-slate-400 font-bold">({player.newElo} Total)</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THREE-PILLAR INVESTMENT ROW                                      */}
      {/* =================================================================== */}
      <div
        data-testid="three-pillar-row"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
      >
        {/* Pillar 1: Competitive Rank & Dynamic Ladder Distance */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border-[2px] border-slate-700/80 shadow-[0_4px_0_rgba(15,23,42,0.95)] flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Rank Tier
            </span>
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-black uppercase tracking-wider ${tierMeta.badgeClass}`}>
                {tierMeta.tier}
              </span>
              <span className="text-base font-black text-white tabular-nums">
                {player.newElo}
              </span>
            </div>
            {/* Dynamic Ladder Distance (e.g., "32 pts to Gold I") */}
            <span className="text-[10px] text-amber-300/90 font-bold mt-1 block truncate">
              {ladderDistance}
            </span>
          </div>
        </div>

        {/* Pillar 2: Subject Mastery */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border-[2px] border-slate-700/80 shadow-[0_4px_0_rgba(15,23,42,0.95)] flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {subject.name}
            </span>
            <Target size={14} className="text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-base font-black text-white tabular-nums">
                {subject.accuracyPercentage}%
              </span>
              <span className="text-[10px] font-bold text-emerald-400">
                {subject.deltaAccuracy >= 0 ? `+${subject.deltaAccuracy}%` : `${subject.deltaAccuracy}%`}
              </span>
            </div>
            {/* Accuracy Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, subject.accuracyPercentage))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pillar 3: School Contribution */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border-[2px] border-slate-700/80 shadow-[0_4px_0_rgba(15,23,42,0.95)] flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              School Turf
            </span>
            <Shield size={14} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-amber-400 tabular-nums">
                +{schoolTurfContribution} PTS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block truncate">
              Credited to {player.schoolCode || "Academy"}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PRIMARY ACTION DOCK (Above-the-Fold Immediate Next Steps)        */}
      {/* =================================================================== */}
      <div
        data-testid="primary-action-dock"
        className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 py-1"
      >
        {/* Primary CTA: [ ⚔️ Instant Rematch (5s) ] */}
        <button
          type="button"
          onClick={handleRequestRematch}
          disabled={rematchState === "WAITING" || rematchState === "OPPONENT_LEFT"}
          className={`flex-1 py-3 px-5 rounded-xl border-2 font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5 cursor-pointer ${
            rematchState === "WAITING"
              ? "bg-indigo-950/80 border-indigo-500 text-indigo-200 cursor-wait ring-2 ring-indigo-500/30"
              : rematchState === "OPPONENT_LEFT"
              ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-[0_3px_0_#064e3b]"
          }`}
        >
          {rematchState === "WAITING" ? (
            <>
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span>Waiting for {opponent.gamerTag}... ({countdown}s)</span>
            </>
          ) : rematchState === "OPPONENT_LEFT" ? (
            <>
              <RotateCcw size={16} className="opacity-40" />
              <span>Opponent left</span>
            </>
          ) : (
            <>
              <Swords size={16} className="stroke-[2.5]" />
              <span>⚔️ Instant Rematch (5s)</span>
            </>
          )}
        </button>

        {/* Secondary CTA: [ Find New Rival → ] */}
        <button
          type="button"
          onClick={onFindNewOpponent}
          className={`flex-1 py-3 px-5 rounded-xl border-2 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
            rematchState === "OPPONENT_LEFT"
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-[0_3px_0_#064e3b] font-black"
              : "bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 shadow-sm active:translate-y-0.5"
          }`}
        >
          <span>Find New Rival</span>
          <ArrowRight size={15} className="stroke-[2.5]" />
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4. MISSED CONCEPTS ACCORDION & PEDAGOGICAL REVISION LOOP            */}
      {/* =================================================================== */}
      <div
        data-testid="missed-concepts-accordion"
        className="w-full bg-slate-900 border-[2px] border-slate-800 rounded-2xl overflow-hidden shadow-[0_4px_0_rgba(15,23,42,0.9)]"
      >
        <button
          type="button"
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Lightbulb size={18} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                {missedQuestions.length > 0
                  ? `Review ${missedQuestions.length} Missed Question${missedQuestions.length > 1 ? "s" : ""}`
                  : "Perfect Run • 0 Missed Concepts"}
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">
                {missedQuestions.length > 0
                  ? "Reinforce critical knowledge gaps before next duel"
                  : "All questions answered correctly"}
              </span>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-slate-800 text-slate-300">
            {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isAccordionOpen && missedQuestions.length > 0 && (
          <div className="p-4 pt-1 flex flex-col gap-4 border-t border-slate-800/80 bg-slate-950/40">
            {missedQuestions.map((q, idx) => {
              const isBookmarked = bookmarkedQuestionIds.has(q.id);
              return (
                <div
                  key={q.id || idx}
                  data-testid={`missed-question-${idx}`}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 shadow-inner"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                    <span className="text-amber-400 mr-1.5 font-black">#{idx + 1}</span>
                    {q.questionText}
                  </p>

                  {/* Answers Comparison with Enhanced High-Contrast Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* User Selection Pill: Label #FCA5A5 (rose-300), Text #FFFFFF (bold white) */}
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 shadow-sm">
                      <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5 stroke-[2.5]" />
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase font-black text-[#FCA5A5] tracking-wider mb-0.5">
                          YOUR ANSWER
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm break-words leading-snug">
                          {q.selectedAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Correct Answer Pill: Label #6EE7B7 (emerald-300), Text #FFFFFF (bold white) */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 shadow-sm">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase font-black text-[#6EE7B7] tracking-wider mb-0.5">
                          CORRECT ANSWER
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm break-words leading-snug">
                          {q.correctAnswer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Rule Breakdown Card */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 shadow-inner">
                    <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] uppercase font-black text-amber-400/90 tracking-wider mb-0.5">
                        Pedagogical Rule
                      </span>
                      <p className="text-xs font-semibold text-slate-200 leading-relaxed break-words">
                        {formatAcademicRule(q.conceptExplanation, q.questionText)}
                      </p>
                    </div>
                  </div>

                  {/* Save to Revision Deck Action */}
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q.id)}
                      disabled={isBookmarked}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                        isBookmarked
                          ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                          : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:text-white"
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck size={14} className="text-emerald-400 stroke-[3]" />
                          <span>Saved to Revision Deck</span>
                        </>
                      ) : (
                        <>
                          <Bookmark size={14} className="text-amber-400 stroke-[2.5]" />
                          <span>🔖 Save to Revision Deck</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
