"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Flame,
  Gem,
  Zap,
  Star,
  Lock,
  CheckCircle2,
  Menu,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/shared/sidebar";
import { StatsProvider, useStats } from "@/components/providers/stats-provider";
import { useCurrentUser } from "@/features/auth/hooks";
import { useQuests, useClaimQuestReward } from "@/features/gamification/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { xp, gems, streak, energy } = useStats();
  const user = useCurrentUser();

  const { data: quests, isLoading: isQuestsLoading, isError: isQuestsError, refetch: refetchQuests } = useQuests();
  const claimRewardMutation = useClaimQuestReward();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on page transition without cascading effect renders
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Active quest replacement logic:
  // Filter out claimed quests so completed/claimed quests disappear and new ones take their place.
  // Sort completed-unclaimed quests first so the user can claim rewards.
  const displayQuests = (quests || [])
    .filter((q) => !q.rewardClaimed)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      return 0;
    })
    .slice(0, 2);

  const userInitial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-text-primary antialiased relative">
      <style>{`
        @keyframes capy-bob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.015); }
        }
        @keyframes wave-pulse {
          0%, 100% { height: 4px; }
          50% { height: 28px; }
        }
        .animate-capy-bob {
          animation: capy-bob 3.5s ease-in-out infinite;
        }
        .wave-bar {
          animation: wave-pulse 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── CENTER CONTENT AREA ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-surface border-r-3 border-border flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-3.5 sm:p-4 border-b-2 border-border bg-bg-secondary sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="p-1.5 border-2 border-border rounded-lg bg-surface shrink-0 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-base sm:text-lg tracking-tight truncate">Nay Prep</span>
          </div>

          {/* Stats on mobile header */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-[#E28743]" title="XP Pool">
              <Zap size={15} fill="#E28743" />
              <span suppressHydrationWarning>{xp}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-red-500" title="Streak">
              <Flame size={15} fill="currentColor" />
              <span suppressHydrationWarning>{streak}</span>
            </div>
            <Link
              href="/profile"
              suppressHydrationWarning
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-border overflow-hidden bg-primary flex items-center justify-center font-black text-text-primary text-xs shrink-0"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        {/* Main Viewport Container */}
        <div className="flex-1 w-full px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 flex flex-col gap-5 sm:gap-6 md:gap-7 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* ─── RIGHT SIDEBAR (STATS & QUESTS) ─────────────────────────────────────── */}
      <aside className="hidden xl:flex w-64 2xl:w-72 bg-bg-primary h-screen flex-col p-3.5 2xl:p-4 sticky top-0 overflow-y-auto gap-4 shrink-0 border-l border-border/20">
        {/* Top Header stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 2xl:gap-2.5 bg-surface px-2.5 2xl:px-3 py-1.5 border-2 border-border rounded-xl">
            {/* Battery / Energy */}
            <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-[#FF9E2C]" title="Energy">
              <span className="text-base sm:text-lg">🔋</span>
              <span suppressHydrationWarning>{energy}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-red-500" title="Streak count">
              <Flame size={15} fill="currentColor" />
              <span suppressHydrationWarning>{streak}</span>
            </div>

            {/* Gems / Diamonds */}
            <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-blue-500" title="Gems / Diamonds">
              <Gem size={14} fill="currentColor" />
              <span suppressHydrationWarning>{gems}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info("No new notifications")}
              className="p-1.5 border-2 border-border bg-surface rounded-xl text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              <Bell size={15} />
            </button>
            <Link
              href="/profile"
              suppressHydrationWarning
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-border overflow-hidden bg-primary cursor-pointer flex items-center justify-center font-black text-text-primary text-xs shadow-[0_1.5px_0_#141827]"
              title={user?.name || "Profile"}
            >
              {userInitial}
            </Link>
          </div>
        </div>

        {/* Try Premium Promo Card */}
        <div className="bg-surface border-2 border-border rounded-xl p-3.5 shadow-offset flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-[#FF9E2C] text-xs tracking-wide uppercase">Try Premium for free</h3>
              <p className="text-[11px] font-bold text-text-secondary leading-snug">
                Get up to 2 weeks free. Cancel anytime.
              </p>
            </div>
            <div className="w-8 h-8 shrink-0 bg-blue-50 border-2 border-border rounded-lg flex items-center justify-center">
              <Gem size={16} className="text-blue-500" fill="#3b82f6" />
            </div>
          </div>

          <button
            onClick={() => {
              toast.success("💎 Premium active! +100 bonus Gems granted.");
            }}
            className="w-full text-center py-2 bg-primary text-text-primary border-2 border-border rounded-lg font-extrabold text-xs tracking-wider shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            START FREE TRIAL
          </button>
        </div>

        {/* Unlock Leaderboards Status Card */}
        <div className="bg-surface border-2 border-border rounded-xl p-3.5 flex flex-col gap-3">
          <h3 className="font-extrabold text-[11px] text-text-secondary tracking-widest uppercase">Unlock Leaderboards</h3>

          <div className="flex flex-col items-center gap-2 py-1 text-center">
            {mounted && xp >= 30 ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#FFFDF6] border-2 border-border flex items-center justify-center text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-extrabold text-text-primary">Rankings Unlocked!</span>
                  <span className="text-[11px] text-text-secondary">View standings under the Leaderboard tab.</span>
                </div>
                <Link
                  href="/leaderboards"
                  className="px-3.5 py-1.5 border-2 border-border rounded-lg text-xs font-bold hover:bg-bg-secondary transition-colors block mt-1"
                >
                  VIEW LEADERBOARD
                </Link>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-border/30 flex items-center justify-center text-text-secondary bg-bg-secondary">
                  <Lock size={18} />
                </div>
                <p className="text-[11px] text-text-secondary px-2">
                  Earn <span className="font-bold text-text-primary">{30 - xp} more XP</span> to start competing
                </p>
              </>
            )}
          </div>
        </div>

        {/* Active Quests Card */}
        <div className="bg-surface border-2 border-border rounded-xl p-3.5 shadow-offset flex flex-col gap-3">
          <h3 className="font-extrabold text-[11px] text-text-secondary tracking-widest uppercase">Active Quests</h3>

          <div className="flex flex-col gap-3">
            {!mounted || (isQuestsLoading && displayQuests.length === 0) ? (
              <div className="flex flex-col gap-2.5 animate-pulse">
                <div className="h-12 bg-bg-primary rounded-xl" />
                <div className="h-12 bg-bg-primary rounded-xl" />
              </div>
            ) : displayQuests && displayQuests.length > 0 ? (
              displayQuests.map((quest) => {
                const percent = Math.min(100, Math.max(0, (quest.currentCount / quest.targetCount) * 100));
                const canClaim = quest.completed && !quest.rewardClaimed;

                return (
                  <div key={quest.periodId || quest.questId} className="flex flex-col gap-1.5 p-2 rounded-xl bg-bg-primary/40 border border-border/20">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-yellow-500 shrink-0">
                        <Star size={16} fill={quest.completed ? "currentColor" : "none"} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs font-bold text-text-primary gap-1">
                          <span className="truncate">{quest.title}</span>
                          <span className="text-[#FF9E2C] font-extrabold shrink-0">+{quest.xpAward} XP</span>
                        </div>
                        <span className="text-[10px] text-text-secondary font-bold">
                          {quest.currentCount} / {quest.targetCount} Completed
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 border-r-2 border-border"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Claim Button for Completed Unclaimed Quests */}
                    {canClaim && (() => {
                      const isClaimingThisQuest = claimRewardMutation.isPending && claimRewardMutation.variables === quest.periodId;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            claimRewardMutation.mutate(quest.periodId, {
                              onSuccess: (data) => {
                                toast.success(`🏆 Claimed +${data.xpAwarded} XP for "${data.questTitle}"!`);
                              },
                              onError: (err) => {
                                toast.error(
                                  err instanceof Error ? err.message : "Failed to claim quest reward"
                                );
                              },
                            });
                          }}
                          disabled={claimRewardMutation.isPending}
                          className="mt-1 w-full py-1.5 bg-primary hover:bg-[#ebd060] text-text-primary border-2 border-border rounded-lg font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
                        >
                          <span>{isClaimingThisQuest ? "CLAIMING..." : `CLAIM (+${quest.xpAward} XP)`}</span>
                        </button>
                      );
                    })()}
                  </div>
                );
              })
            ) : isQuestsError ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <AlertTriangle size={28} className="text-yellow-500 opacity-80" />
                <p className="text-xs font-bold text-text-primary">Couldn&apos;t load quests</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  There was a problem reaching the server.
                </p>
                <button
                  type="button"
                  onClick={() => refetchQuests()}
                  className="mt-1 flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-[#ebd060] text-text-primary border-2 border-border rounded-lg font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : quests !== undefined ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle2 size={28} className="text-primary opacity-80" />
                <p className="text-xs font-bold text-text-primary">All quests complete!</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  New quests refresh daily &amp; weekly. Check back soon.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-14 bg-bg-primary rounded-xl" />
                <div className="h-14 bg-bg-primary rounded-xl" />
              </div>
            )}
          </div>

          {/* Quick Quiz shortcut */}
          <Link
            href="/study"
            className="w-full py-2 border-2 border-border text-center text-xs font-black rounded-xl hover:bg-bg-secondary transition-colors block"
          >
            PLAY PRACTICE QUIZ
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <StatsProvider>
      <LayoutContent>{children}</LayoutContent>
    </StatsProvider>
  );
}
