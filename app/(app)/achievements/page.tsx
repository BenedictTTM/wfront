"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  Crown,
  Flame,
  Swords,
  Medal,
  Award,
  Sparkles,
  Gift,
  Shield,
  Clock,
  ChevronRight,
  X,
  Check,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useStats } from "@/components/providers/stats-provider";
import {
  useQuests,
  useClaimQuestReward,
  useDashboard,
} from "@/features/gamification/hooks";
import { useAnalyticsOverview } from "@/features/analytics/hooks";

type AchievementCategory = "All" | "Quizzes" | "Streaks" | "Mastery" | "Multiplayer";

interface AchievementBase {
  id: string;
  title: string;
  category: "Quizzes" | "Streaks" | "Mastery" | "Multiplayer";
  icon: string;
  xpAward: number;
  gemsAward?: number;
  tierText: string;
  tierStars: string;
  targetCount: number;
  unit?: string;
  metricKey: "quizzes" | "streak" | "accuracy_perfect" | "speed" | "mastery" | "pvp_wins" | "pvp_flawless";
  lockRequirement?: string;
}

const ACHIEVEMENT_DEFINITIONS: AchievementBase[] = [
  {
    id: "quiz-enthusiast",
    title: "Quiz Enthusiast",
    category: "Quizzes",
    icon: "📖",
    xpAward: 250,
    gemsAward: 20,
    tierText: "Tier 1: Complete 10 quizzes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 10,
    metricKey: "quizzes",
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    category: "Quizzes",
    icon: "⚡",
    xpAward: 500,
    gemsAward: 50,
    tierText: "Tier 2: Complete 50 quizzes",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 50,
    metricKey: "quizzes",
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    category: "Quizzes",
    icon: "⏱️",
    xpAward: 450,
    gemsAward: 30,
    tierText: "Tier 1: Finish a quiz in under 3 minutes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 1,
    metricKey: "speed",
  },
  {
    id: "streak-prodigy",
    title: "Streak Prodigy",
    category: "Streaks",
    icon: "🔥",
    xpAward: 300,
    gemsAward: 25,
    tierText: "Tier 1: Reach a 7-day study streak",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 7,
    unit: " days",
    metricKey: "streak",
  },
  {
    id: "olympian-scholar",
    title: "Olympian Scholar",
    category: "Streaks",
    icon: "🛡️",
    xpAward: 1000,
    gemsAward: 100,
    tierText: "Tier 2: Reach a 30-day streak",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 30,
    unit: " days",
    metricKey: "streak",
  },
  {
    id: "sharpshooter",
    title: "Sharpshooter",
    category: "Mastery",
    icon: "🎯",
    xpAward: 400,
    gemsAward: 35,
    tierText: "Tier 1: Score 100% on 3 quizzes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 3,
    metricKey: "accuracy_perfect",
  },
  {
    id: "subject-specialist",
    title: "Subject Specialist",
    category: "Mastery",
    icon: "🧬",
    xpAward: 750,
    gemsAward: 60,
    tierText: "Tier 1: Reach 90% mastery in any subject",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 90,
    unit: "%",
    metricKey: "mastery",
  },
  {
    id: "syllabus-legend",
    title: "Syllabus Legend",
    category: "Mastery",
    icon: "👑",
    xpAward: 1500,
    gemsAward: 150,
    tierText: "Tier 3: Master all subject core modules",
    tierStars: "★★★ Tier 3 of 3",
    targetCount: 5,
    metricKey: "mastery",
    lockRequirement: "Unlocks after Tier 2 Mastery",
  },
  {
    id: "arena-contender",
    title: "Arena Contender",
    category: "Multiplayer",
    icon: "⚔️",
    xpAward: 600,
    gemsAward: 50,
    tierText: "Tier 1: Win 5 live 1v1 showdowns",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 5,
    metricKey: "pvp_wins",
  },
  {
    id: "flawless-victory",
    title: "Flawless Victory",
    category: "Multiplayer",
    icon: "✨",
    xpAward: 800,
    gemsAward: 75,
    tierText: "Tier 1: Win a match without a wrong answer",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 1,
    metricKey: "pvp_flawless",
  },
  {
    id: "duels-champion",
    title: "Duels Champion",
    category: "Multiplayer",
    icon: "🎖️",
    xpAward: 1000,
    gemsAward: 100,
    tierText: "Tier 2: Win 15 multiplayer showdowns",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 15,
    metricKey: "pvp_wins",
  },
];

const BADGES_COLLECTION = [
  {
    id: "scholar-seal",
    name: "Achimota Scholar's Crest",
    description: "Conferred for rigorous academic excellence in secondary sciences.",
    icon: "🏫",
    rarity: "EPIC",
    requirement: "Complete 50 quizzes with >80% accuracy",
  },
  {
    id: "streak-flame",
    name: "Olympian Torch of Habit",
    description: "Awarded to relentless students maintaining active study streaks.",
    icon: "🔥",
    rarity: "RARE",
    requirement: "Maintain a 7-day study streak",
  },
  {
    id: "perfect-score",
    name: "Centurion Bullseye",
    description: "Given for attaining flawless 100% scores on standardized mock papers.",
    icon: "🎯",
    rarity: "LEGENDARY",
    requirement: "Score 100% on 3 timed mock quizzes",
  },
  {
    id: "arena-champion",
    name: "Gladiator of WAEC",
    description: "Proof of dominance across regional live 1v1 academic showdowns.",
    icon: "⚔️",
    rarity: "EPIC",
    requirement: "Win 5 live multiplayer 1v1 challenges",
  },
];

export default function AchievementsPage() {
  const { data: me, isLoading: isLoadingAuth } = useMe();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalyticsOverview(undefined, "all");
  const { data: serverQuests } = useQuests();
  const { addXp, addGems, streak: localStreak, completedQuizzes: localQuizzes } = useStats();
  const claimMutation = useClaimQuestReward();

  const isGuest = !me || isGuestIdentity(me);
  const userId = !isGuest ? me.id : me && isGuestIdentity(me) ? me.sessionId : "guest";

  const [claimedLocalIds, setClaimedLocalIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>("All");
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Load locally claimed achievement flags
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`wassce_claimed_achievements_${userId}`);
      if (saved) {
        setClaimedLocalIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load local claimed achievements", e);
    }
  }, [userId]);

  // Genuine Metric Values
  const realQuizzes =
    analytics?.snapshot?.quizzesCompleted ??
    (localQuizzes > 0 ? localQuizzes : 0);

  const realStreak =
    dashboard?.streak?.longest ??
    dashboard?.streak?.current ??
    localStreak ??
    0;

  // Synthesize genuine achievement items
  const items = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      // Check if server quest matches
      const serverMatch = serverQuests?.find(
        (q) => q.slug === def.id || q.title.toLowerCase() === def.title.toLowerCase()
      );

      let current = 0;
      let isUnlocked = false;
      let canClaim = false;

      if (serverMatch) {
        current = serverMatch.currentCount ?? 0;
        if (serverMatch.rewardClaimed || claimedLocalIds[def.id]) {
          isUnlocked = true;
        } else if (serverMatch.completed || current >= def.targetCount) {
          canClaim = true;
        }
      } else {
        // Compute from genuine live data
        switch (def.metricKey) {
          case "quizzes":
            current = realQuizzes;
            break;
          case "streak":
            current = realStreak;
            break;
          default:
            current = 0;
            break;
        }

        if (claimedLocalIds[def.id]) {
          isUnlocked = true;
        } else if (current >= def.targetCount) {
          canClaim = true;
        }
      }

      const isLocked = !isUnlocked && !canClaim && Boolean(def.lockRequirement && current === 0);

      const status: "IN_PROGRESS" | "CAN_CLAIM" | "UNLOCKED" | "LOCKED" = isUnlocked
        ? "UNLOCKED"
        : canClaim
        ? "CAN_CLAIM"
        : isLocked
        ? "LOCKED"
        : "IN_PROGRESS";

      return {
        ...def,
        currentCount: current,
        status,
      };
    });
  }, [serverQuests, claimedLocalIds, realQuizzes, realStreak]);

  // Handle claiming rewards
  const handleClaim = (item: (typeof items)[0]) => {
    addXp(item.xpAward, `Achievement: ${item.title}`);
    if (item.gemsAward) {
      addGems(item.gemsAward);
    }

    const updated = { ...claimedLocalIds, [item.id]: true };
    setClaimedLocalIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`wassce_claimed_achievements_${userId}`, JSON.stringify(updated));
    }

    const serverMatch = serverQuests?.find(
      (q) => q.slug === item.id || q.title.toLowerCase() === item.title.toLowerCase()
    );
    if (serverMatch && serverMatch.periodId) {
      claimMutation.mutate(serverMatch.periodId);
    }

    toast.success(`🎁 Claimed +${item.xpAward} XP & +${item.gemsAward || 0} Gems for "${item.title}"!`);
  };

  // Metrics
  const unlockedCount = items.filter((a) => a.status === "UNLOCKED").length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Next reward milestone
  const nextTarget = 3;
  const remainingForNext = Math.max(0, nextTarget - unlockedCount);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: items.length,
      Quizzes: items.filter((a) => a.category === "Quizzes").length,
      Streaks: items.filter((a) => a.category === "Streaks").length,
      Mastery: items.filter((a) => a.category === "Mastery").length,
      Multiplayer: items.filter((a) => a.category === "Multiplayer").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((a) => a.category === selectedCategory);
  }, [items, selectedCategory]);

  const categories: AchievementCategory[] = [
    "All",
    "Quizzes",
    "Streaks",
    "Mastery",
    "Multiplayer",
  ];

  const isLoading = isLoadingAuth || isLoadingDashboard || isLoadingAnalytics;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
          <div className="h-10 w-28 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
        </div>
        <div className="border-2.5 border-border bg-surface rounded-2xl p-6 shadow-offset h-36 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2.5 border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Achievements & Trophies
          </h1>
          <p className="text-xs sm:text-sm font-bold text-text-secondary mt-1">
            Unlock academic milestones, earn bonus XP, and collect prestige badges
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBadgesModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border-2.5 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Award className="w-4 h-4 text-text-primary" />
          <span>Honor Badges</span>
        </button>
      </div>

      {/* ── Guest Session Notice ── */}
      {isGuest && (
        <div className="border-2.5 border-border bg-amber-500/10 rounded-2xl p-4 sm:p-5 shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 border-2 border-border mt-0.5 shadow-[0_2px_0_#141827] shrink-0">
              <UserPlus className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">
                Guest Achievements Mode
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-0.5">
                Milestones unlocked during this session are saved locally. Register to preserve your permanent trophy showcase.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs text-center transition-all shadow-[0_2px_0_#141827] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            Create Permanent Account
          </Link>
        </div>
      )}

      {/* ── SUMMARY & REWARD MILESTONE HERO ── */}
      <div className="border-2.5 border-border bg-surface rounded-2xl p-5 sm:p-6 shadow-offset flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Trophy icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/40 border-2.5 border-border flex items-center justify-center text-2xl sm:text-3xl shadow-[0_3px_0_#141827] shrink-0 select-none">
          🏆
        </div>

        {/* Hero Progress Details */}
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-black text-text-primary uppercase tracking-wider">
              TOTAL PROGRESS: {unlockedCount} OF {totalCount} UNLOCKED
            </h2>
            <span className="text-xs sm:text-sm font-black text-text-primary tabular-nums">
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-muted border-2.5 border-border rounded-full h-3.5 sm:h-4 overflow-hidden relative">
            <div
              className="h-full bg-primary border-r-2 border-border transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Next reward milestone */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-primary">
            <span className="text-base">🎁</span>
            {remainingForNext > 0 ? (
              <span>
                <strong className="font-black">Next Milestone:</strong> +500 Gems at {nextTarget} Unlocked{" "}
                <span className="text-text-secondary font-bold">
                  ({remainingForNext} remaining)
                </span>
              </span>
            ) : (
              <span>
                <strong className="font-black">Milestone Achieved!</strong> Keep unlocking to earn elite rankings.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const count = categoryCounts[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-primary text-text-primary border-2 border-border shadow-[0_2.5px_0_#141827]"
                  : "bg-surface text-text-secondary hover:text-text-primary border-2 border-border hover:bg-surface-muted shadow-[0_2px_0_#141827] active:translate-y-0.5"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                  isSelected
                    ? "bg-surface border-border text-text-primary"
                    : "bg-surface-muted border-border/40 text-text-secondary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ACHIEVEMENTS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredItems.map((item) => {
          const percent = Math.min(
            100,
            Math.max(0, (item.currentCount / item.targetCount) * 100)
          );

          const isClaimable = item.status === "CAN_CLAIM";
          const isUnlocked = item.status === "UNLOCKED";
          const isLocked = item.status === "LOCKED";

          return (
            <div
              key={item.id}
              className={`p-5 border-2.5 border-border rounded-2xl shadow-offset flex flex-col justify-between gap-3.5 transition-all ${
                isUnlocked
                  ? "bg-surface/90 opacity-95"
                  : isClaimable
                  ? "bg-primary/10 ring-2 ring-primary ring-offset-1"
                  : isLocked
                  ? "bg-surface-muted/50 opacity-75"
                  : "bg-surface"
              }`}
            >
              {/* Top Row: Icon + Title + XP Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-bg-secondary border-2 border-border flex items-center justify-center text-xl shrink-0 shadow-[0_2px_0_#141827] select-none">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black text-sm sm:text-base text-text-primary tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-xs font-bold text-text-secondary">
                      {item.tierText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-primary/25 text-text-primary border-2 border-border px-2.5 py-0.5 rounded-lg font-black text-xs shadow-sm">
                    +{item.xpAward} XP
                  </span>
                  {item.gemsAward && (
                    <span className="bg-blue-500/15 text-blue-800 border-2 border-border px-2 py-0.5 rounded-lg font-black text-xs shadow-sm">
                      +{item.gemsAward} 💎
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Counter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className={`h-full border-r-2 border-border transition-all duration-500 ${
                        isUnlocked
                          ? "bg-emerald-400"
                          : isClaimable
                          ? "bg-primary animate-pulse"
                          : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-text-primary tabular-nums shrink-0">
                    {item.currentCount} / {item.targetCount}
                    {item.unit || ""}
                  </span>
                </div>
              </div>

              {/* Footer: Tier Stars OR Claim Button OR Status Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-border/15 gap-2">
                <span className="text-xs font-extrabold text-text-secondary flex items-center gap-1">
                  {item.tierStars}
                </span>

                {isClaimable ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(item)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer animate-bounce"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>CLAIM REWARD</span>
                  </button>
                ) : isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Check className="w-3 h-3 text-emerald-700" />
                    UNLOCKED
                  </span>
                ) : isLocked ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-text-secondary bg-surface-muted border border-border/40 px-2.5 py-0.5 rounded-lg">
                    <Lock className="w-3 h-3 text-text-secondary" />
                    <span>{item.lockRequirement || "Locked"}</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-text-secondary">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── HONOR BADGES MODAL ── */}
      {isBadgesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border-2.5 border-border rounded-2xl p-6 sm:p-7 shadow-offset flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border flex items-center justify-center font-black text-lg shadow-[0_2px_0_#141827]">
                  🎖️
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary">
                    Academic Honor Badges
                  </h3>
                  <p className="text-xs font-bold text-text-secondary">
                    Prestige crests unlocked through high performance and study consistency
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBadgesModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BADGES_COLLECTION.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border-2 border-border bg-bg-secondary flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-border uppercase bg-surface">
                      {b.rarity}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-text-primary">{b.name}</h4>
                    <p className="text-[11px] font-medium text-text-secondary mt-0.5 leading-tight">
                      {b.description}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-text-primary bg-surface/70 px-2 py-1 rounded border border-border/40">
                      Requirement: {b.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t-2 border-border">
              <button
                type="button"
                onClick={() => setIsBadgesModalOpen(false)}
                className="px-4 py-2 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Close Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
