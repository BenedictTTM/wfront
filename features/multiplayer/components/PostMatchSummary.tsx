"use client";
// features/multiplayer/components/PostMatchSummary.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  QuestionFeedbackItem,
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

interface QuestionReviewCardProps {
  question: QuestionFeedbackItem;
  index: number;
  isExpanded: boolean;
  isBookmarked: boolean;
  onToggleDetails: () => void;
  onBookmark: () => void;
}

/**
 * Individual Question Review Card
 * Displays question title, correctness status, and an expandable dropdown for detailed breakdown.
 */
const QuestionReviewCard = React.memo(function QuestionReviewCard({
  question,
  index,
  isExpanded,
  isBookmarked,
  onToggleDetails,
  onBookmark,
}: QuestionReviewCardProps) {
  const isQuestionCorrect = question.isCorrect ?? false;
  const displayIndex = question.questionIndex !== undefined ? question.questionIndex + 1 : index + 1;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggleDetails();
    }
  };

  return (
    <div
      data-testid={`missed-question-${index}`}
      className="rounded-2xl bg-surface border-[2px] border-border overflow-hidden shadow-[0_2px_0_#141827] transition-all"
    >
      {/* ── Question Header Row: Always Present & Clickable ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleDetails}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer hover:bg-surface-muted/40 transition-colors select-none"
      >
        <div className="flex items-start gap-2 sm:gap-2.5 min-w-0 flex-1">
          <span className="inline-block px-1.5 py-0.5 rounded-md bg-primary border border-border text-[10px] font-black text-text-primary shrink-0 mt-0.5 shadow-[0_1px_0_#141827]">
            #{displayIndex}
          </span>
          <p className="text-xs sm:text-sm font-black text-text-primary leading-snug line-clamp-2">
            {question.questionText}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Verified / Countered Outcome Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 ${
              isQuestionCorrect
                ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                : "bg-rose-100 border-rose-400 text-rose-950"
            }`}
          >
            {isQuestionCorrect ? (
              <>
                <CheckCircle2 size={11} className="text-emerald-700 stroke-[3]" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <XCircle size={11} className="text-rose-700 stroke-[3]" />
                <span>Countered</span>
              </>
            )}
          </span>

          {/* Dropdown Toggle Button */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg border border-border text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_1px_0_#141827] ${
              isExpanded
                ? "bg-primary text-text-primary"
                : "bg-surface hover:bg-surface-muted text-text-primary"
            }`}
          >
            <span>{isExpanded ? "Hide" : "Details"}</span>
            {isExpanded ? (
              <ChevronUp size={12} className="stroke-[2.5]" />
            ) : (
              <ChevronDown size={12} className="stroke-[2.5]" />
            )}
          </span>
        </div>
      </div>

      {/* ── Hidden Details: Dropdown Section ── */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-2 sm:pt-2 flex flex-col gap-3 border-t-[1.5px] border-border/30 bg-surface-muted/20 animate-in fade-in duration-150">
          {/* Answers Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* User Selection Pill */}
            <div
              className={`p-3 rounded-xl border-[1.5px] border-border flex items-start gap-2.5 shadow-[0_1px_0_#141827] ${
                isQuestionCorrect ? "bg-emerald-50" : "bg-rose-50"
              }`}
            >
              {isQuestionCorrect ? (
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
              ) : (
                <XCircle size={16} className="text-rose-700 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <div className="min-w-0">
                <span
                  className={`block text-[10px] uppercase font-black tracking-wider mb-0.5 ${
                    isQuestionCorrect ? "text-emerald-800" : "text-rose-800"
                  }`}
                >
                  {isQuestionCorrect ? "YOUR ANSWER (CORRECT)" : "YOUR ANSWER"}
                </span>
                <span className="font-bold text-text-primary text-xs sm:text-sm break-words leading-snug">
                  {question.selectedAnswer}
                </span>
              </div>
            </div>

            {/* Correct Answer Pill */}
            <div className="p-3 rounded-xl bg-emerald-50 border-[1.5px] border-border flex items-start gap-2.5 shadow-[0_1px_0_#141827]">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-black text-emerald-800 tracking-wider mb-0.5">
                  CORRECT ANSWER
                </span>
                <span className="font-bold text-text-primary text-xs sm:text-sm break-words leading-snug">
                  {question.correctAnswer}
                </span>
              </div>
            </div>
          </div>

          {/* Concept Rule Breakdown Card */}
          <div className="p-3 rounded-xl bg-surface border border-border flex items-start gap-2.5 shadow-sm">
            <Lightbulb size={16} className="text-text-primary shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-black text-text-secondary tracking-wider mb-0.5">
                Concept Breakdown
              </span>
              <p className="text-xs font-bold text-text-primary leading-relaxed break-words">
                {formatAcademicRule(question.conceptExplanation, question.questionText)}
              </p>
            </div>
          </div>

          {/* Save to Revision Deck Action */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={onBookmark}
              disabled={isBookmarked}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] border-border text-xs font-black uppercase tracking-wider transition-all shadow-[0_2px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 cursor-pointer ${
                isBookmarked
                  ? "bg-secondary text-text-primary opacity-80 cursor-default"
                  : "bg-surface hover:bg-surface-muted text-text-primary hover:-translate-y-0.5"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck size={14} className="stroke-[3]" />
                  <span>Saved to Revision Deck</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} className="stroke-[2.5]" />
                  <span>🔖 Save to Revision Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Production-Ready Post-Match Summary Screen
 * Tactile Neo-Brutalist settlement screen featuring hero stats, progression pillars,
 * persistent action dock, and collapsible concept review with question-level dropdowns.
 */
export const PostMatchSummary = React.memo(function PostMatchSummary({
  data,
  onLaunchRematch,
  onFindNewOpponent,
  onEmitRematchRequest,
  onBookmarkQuestion,
  rematchAcceptedMatchId = null,
}: PostMatchSummaryProps) {
  const { result, player, opponent, subject, schoolTurfContribution, missedQuestions, allQuestions } = data;

  // ── Rematch Handshake State Machine ──
  const [rematchState, setRematchState] = useState<RematchState>("IDLE");
  const [countdown, setCountdown] = useState(5);

  // ── Base & Filtered Questions ──
  const baseQuestions = useMemo(() => {
    if (allQuestions && allQuestions.length > 0) return allQuestions;
    return missedQuestions.map((q) => ({ ...q, isCorrect: false }));
  }, [allQuestions, missedQuestions]);

  const missedCount = useMemo(() => {
    return baseQuestions.filter((q) => q.isCorrect === false).length;
  }, [baseQuestions]);

  // ── Questions Review & Bookmarking State ──
  const [isAccordionOpen, setIsAccordionOpen] = useState(baseQuestions.length > 0);
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "MISSED">("ALL");
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<string>>(new Set());
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());

  const displayedQuestions = useMemo(() => {
    return reviewFilter === "MISSED"
      ? baseQuestions.filter((q) => q.isCorrect === false)
      : baseQuestions;
  }, [reviewFilter, baseQuestions]);

  const allExpanded = useMemo(() => {
    return (
      displayedQuestions.length > 0 &&
      displayedQuestions.every((q, i) => expandedQuestionIds.has(q.id || `q-${i}`))
    );
  }, [displayedQuestions, expandedQuestionIds]);

  // ── Handlers ──
  const handleToggleQuestionDetails = useCallback((questionKey: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionKey)) {
        next.delete(questionKey);
      } else {
        next.add(questionKey);
      }
      return next;
    });
  }, []);

  const handleToggleExpandAll = useCallback(() => {
    if (allExpanded) {
      setExpandedQuestionIds(new Set());
    } else {
      setExpandedQuestionIds(
        new Set(displayedQuestions.map((q, i) => q.id || `q-${i}`))
      );
    }
  }, [allExpanded, displayedQuestions]);

  const handleRequestRematch = useCallback(() => {
    if (rematchState !== "IDLE") return;
    setRematchState("WAITING");
    setCountdown(5);
    onEmitRematchRequest?.(data.matchId);
  }, [rematchState, onEmitRematchRequest, data.matchId]);

  const handleToggleBookmark = useCallback((questionId: string) => {
    setBookmarkedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    onBookmarkQuestion?.(questionId);
  }, [onBookmarkQuestion]);

  // ── Rematch Effects ──
  useEffect(() => {
    if (rematchAcceptedMatchId) {
      setRematchState("ACCEPTED");
      onLaunchRematch(rematchAcceptedMatchId);
    }
  }, [rematchAcceptedMatchId, onLaunchRematch]);

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
      {/* 1. HERO HEADER: Solid Cream Neo-Brutalist Card with Stark Borders   */}
      {/* =================================================================== */}
      <div
        data-testid="post-match-hero"
        className="w-full py-5 sm:py-6 px-5 sm:px-6 rounded-3xl border-[3px] border-border bg-surface shadow-[0_6px_0_#141827] flex flex-col items-center text-center gap-3"
      >
        <div className="flex items-center justify-center">
          {result === "VICTORY" ? (
            <div className="w-12 h-12 rounded-2xl bg-primary border-[2.5px] border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827]">
              <Trophy size={24} className="stroke-[2.5]" />
            </div>
          ) : result === "DEFEAT" ? (
            <div className="w-12 h-12 rounded-2xl bg-secondary border-[2.5px] border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827]">
              <Swords size={24} className="stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-surface-muted border-[2.5px] border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827]">
              <Scale size={24} className="stroke-[2.5]" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-text-primary uppercase leading-tight">
            {heroMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-bold mt-1">
            {player.finalScore} PTS <span className="opacity-60">•</span> Opponent: {opponent.finalScore} PTS
          </p>
        </div>

        {/* ELO Delta indicator with directional arrow */}
        <div
          data-testid="hero-elo-delta"
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-muted border-[2px] border-border shadow-[0_1.5px_0_#141827]"
        >
          {player.eloDelta < 0 ? (
            <TrendingDown size={14} className="text-text-secondary stroke-[2.5]" />
          ) : player.eloDelta > 0 ? (
            <TrendingUp size={14} className="text-emerald-700 stroke-[2.5]" />
          ) : (
            <TrendingUp size={14} className="text-text-secondary stroke-[2.5]" />
          )}
          <span className="text-xs sm:text-sm font-black tabular-nums tracking-wide text-text-primary">
            {player.eloDelta < 0 ? `↘ ${heroMeta.eloDeltaText} ELO` : player.eloDelta > 0 ? `↗ ${heroMeta.eloDeltaText} ELO` : `0 ELO`}
          </span>
          <span className="text-[11px] text-text-secondary font-black">({player.newElo} Total)</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THREE-PILLAR INVESTMENT ROW (Uniform Neo-Brutalist Card Modules)  */}
      {/* =================================================================== */}
      <div
        data-testid="three-pillar-row"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full"
      >
        {/* Pillar 1: Competitive Rank & Dynamic Ladder Distance */}
        <div className="p-4 rounded-2xl bg-surface border-[2.5px] border-border shadow-[0_3px_0_#141827] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Rank Tier
            </span>
            <Sparkles size={14} className="text-text-primary stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary border-[1.5px] border-border text-[11px] font-black uppercase tracking-wider text-text-primary shadow-[0_1px_0_#141827]">
                {tierMeta.tier}
              </span>
              <span className="text-base sm:text-lg font-black text-text-primary tabular-nums">
                {player.newElo}
              </span>
            </div>
            <span className="text-[11px] text-text-secondary font-bold mt-1.5 block truncate">
              {ladderDistance}
            </span>
          </div>
        </div>

        {/* Pillar 2: Subject Mastery */}
        <div className="p-4 rounded-2xl bg-surface border-[2.5px] border-border shadow-[0_3px_0_#141827] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary truncate max-w-[120px]">
              {subject.name}
            </span>
            <Target size={14} className="text-text-primary stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-base sm:text-lg font-black text-text-primary tabular-nums">
                {subject.accuracyPercentage}%
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-black text-text-primary shadow-[0_1px_0_#141827]">
                {subject.deltaAccuracy >= 0 ? `+${subject.deltaAccuracy}%` : `${subject.deltaAccuracy}%`}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-muted border-[1.5px] border-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, subject.accuracyPercentage))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pillar 3: School Contribution */}
        <div className="p-4 rounded-2xl bg-surface border-[2.5px] border-border shadow-[0_3px_0_#141827] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              School Turf
            </span>
            <Shield size={14} className="text-text-primary stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-text-primary tabular-nums">
                +{schoolTurfContribution} PTS
              </span>
            </div>
            <span className="text-[11px] text-text-secondary font-bold mt-1.5 block truncate">
              Credited to {player.schoolCode || "Academy"}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PRIMARY ACTION DOCK (Clean Typography & Zero Heavy Gradients)    */}
      {/* =================================================================== */}
      <div
        data-testid="primary-action-dock"
        className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-1"
      >
        {/* Primary CTA: [ ⚔️ Instant Rematch (5s) ] */}
        <button
          type="button"
          onClick={handleRequestRematch}
          disabled={rematchState === "WAITING" || rematchState === "OPPONENT_LEFT"}
          className={`flex-1 py-3.5 px-5 rounded-2xl border-[2.5px] border-border font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            rematchState === "WAITING"
              ? "bg-primary/30 text-text-primary cursor-wait shadow-[0_2px_0_#141827]"
              : rematchState === "OPPONENT_LEFT"
              ? "bg-surface-muted text-text-secondary opacity-60 cursor-not-allowed shadow-none"
              : "bg-primary hover:bg-[#ebd060] text-text-primary shadow-[0_4px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5"
          }`}
        >
          {rematchState === "WAITING" ? (
            <>
              <Loader2 size={16} className="animate-spin text-text-primary" />
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
              <span>Instant Rematch (5s)</span>
            </>
          )}
        </button>

        {/* Secondary CTA: [ Find New Rival → ] */}
        <button
          type="button"
          onClick={onFindNewOpponent}
          className={`flex-1 py-3.5 px-5 rounded-2xl border-[2.5px] border-border font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            rematchState === "OPPONENT_LEFT"
              ? "bg-primary hover:bg-[#ebd060] text-text-primary shadow-[0_4px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5"
              : "bg-surface hover:bg-surface-muted text-text-primary shadow-[0_4px_0_#141827] active:shadow-[0_1px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5"
          }`}
        >
          <span>Find New Rival</span>
          <ArrowRight size={15} className="stroke-[3]" />
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4. EXPANDABLE NEO-BRUTALIST ACCORDION: REVIEW ALL QUESTIONS & CONCEPTS */}
      {/* =================================================================== */}
      <div
        data-testid="missed-concepts-accordion"
        className="w-full bg-surface border-[2.5px] border-border rounded-2xl overflow-hidden shadow-[0_4px_0_#141827]"
      >
        {/* Accordion Header */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-muted/50 transition-colors">
          <button
            type="button"
            onClick={() => setIsAccordionOpen((prev) => !prev)}
            className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center text-text-primary shrink-0 shadow-[0_1px_0_#141827]">
              <Lightbulb size={18} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black text-text-primary uppercase tracking-wide block truncate">
                Question Feedback &amp; Concept Breakdown
              </span>
              <span className="block text-[11px] text-text-secondary font-medium">
                {missedCount > 0
                  ? `${missedCount} concept gap${missedCount > 1 ? "s" : ""} identified • Review all questions below`
                  : "Flawless duel • Review concepts and reinforce learning"}
              </span>
            </div>
          </button>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Filter Pills */}
            {baseQuestions.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-muted border border-border">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReviewFilter("ALL");
                    setIsAccordionOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    reviewFilter === "ALL"
                      ? "bg-primary text-text-primary shadow-[0_1px_0_#141827]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  All ({baseQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReviewFilter("MISSED");
                    setIsAccordionOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    reviewFilter === "MISSED"
                      ? "bg-rose-100 text-rose-950 shadow-[0_1px_0_#141827]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Missed ({missedCount})
                </button>
              </div>
            )}

            {/* Chevron Toggle */}
            <button
              type="button"
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="p-1.5 rounded-xl bg-surface border-[1.5px] border-border text-text-primary shadow-[0_1px_0_#141827] cursor-pointer"
              aria-label={isAccordionOpen ? "Collapse review" : "Expand review"}
            >
              {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Accordion Content */}
        {isAccordionOpen && (
          <div className="p-3 sm:p-4 pt-2 sm:pt-2 flex flex-col gap-3 border-t-[2px] border-border bg-surface-muted/30">
            {displayedQuestions.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface border border-border text-center">
                <p className="text-xs font-black uppercase text-emerald-700">
                  Zero missed questions — 100% accuracy on these concepts!
                </p>
              </div>
            ) : (
              <>
                {/* Questions Overview Sub-bar with Master Expand/Collapse */}
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-text-secondary">
                  <span>
                    {displayedQuestions.length} {displayedQuestions.length === 1 ? "question" : "questions"} • Tap to inspect details
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleExpandAll}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary font-black uppercase tracking-wider hover:bg-surface-muted shadow-[0_1px_0_#141827] cursor-pointer text-[10px] transition-all active:translate-y-0.5"
                  >
                    <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
                    {allExpanded ? (
                      <ChevronUp size={12} className="stroke-[2.5]" />
                    ) : (
                      <ChevronDown size={12} className="stroke-[2.5]" />
                    )}
                  </button>
                </div>

                {/* Render Individual Question Cards */}
                {displayedQuestions.map((q, idx) => {
                  const questionKey = q.id || `q-${idx}`;
                  return (
                    <QuestionReviewCard
                      key={questionKey}
                      question={q}
                      index={idx}
                      isExpanded={expandedQuestionIds.has(questionKey)}
                      isBookmarked={bookmarkedQuestionIds.has(q.id)}
                      onToggleDetails={() => handleToggleQuestionDetails(questionKey)}
                      onBookmark={() => handleToggleBookmark(q.id)}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
