"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Flame,
  Gem,
  Zap,
  Star,
  Lock,
  CheckCircle2,
  Menu,
  LogIn,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/shared/sidebar";
import { StatsProvider, useStats } from "@/components/providers/stats-provider";
import { useCurrentUser, useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useQuests, useClaimQuestReward } from "@/features/gamification/hooks";
import { useLockIn } from "@/features/mock-exam/lockin-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const GUEST_MAX_ENERGY = 10;

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { xp, gems, streak, energy, completedQuizzes } = useStats();
  const user = useCurrentUser();
  const { data: meData } = useMe();
  const isGuest = !meData || isGuestIdentity(meData);
  const router = useRouter();
  const { isLockInActive } = useLockIn();

  // Cap energy for guests
  const displayEnergy = isGuest ? Math.min(energy, GUEST_MAX_ENERGY) : energy;

  const { data: quests, isLoading: isQuestsLoading } = useQuests();
  const claimRewardMutation = useClaimQuestReward();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userInitial = isGuest ? "G" : (user?.name?.[0] || user?.email?.[0] || "S").toUpperCase();

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-text-primary antialiased relative">
      {/* LockIn™ immersive mode CSS — hides chrome when data-lockin="active" is set on <html> */}
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
        /* LockIn™ immersive mode: hide sidebar chrome */
        [data-lockin="active"] .lockin-hide {
          display: none !important;
        }
        [data-lockin="active"] main {
          border-right: none !important;
        }
      `}</style>

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div className="lockin-hide">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden lockin-hide"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── CENTER CONTENT AREA ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-surface border-r-3 border-border flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="lg:hidden lockin-hide flex items-center justify-between p-4 border-b-2 border-border bg-bg-secondary sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 border-2 border-border rounded-lg bg-surface"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-lg tracking-tight">Nay Prep</span>
          </div>

          {/* Stats on mobile header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-sm text-[#E28743]" title="XP Pool">
              <Zap size={16} fill="#E28743" />
              <span>{xp}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-red-500" title="Streak">
              <Flame size={16} fill="currentColor" />
              <span>{streak}</span>
            </div>
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full border-2 border-border overflow-hidden bg-primary flex items-center justify-center font-black text-text-primary text-xs"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        {/* Main Viewport Container */}
        <div className={`flex-1 w-full px-6 py-8 md:p-10 flex flex-col gap-10 ${
          isLockInActive ? 'max-w-none' : 'max-w-4xl mx-auto'
        }`}>
          {children}
        </div>
      </main>

      {/* ─── RIGHT SIDEBAR (STATS & QUESTS) ─────────────────────────────────────── */}
      <aside className="lockin-hide hidden lg:flex w-80 bg-bg-primary h-screen flex-col p-6 sticky top-0 overflow-y-auto gap-6 shrink-0 border-l border-border/20">
        {/* Top Header stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 bg-surface px-4 py-2 border-2 border-border rounded-xl">
            {/* Battery / Energy */}
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#FF9E2C]" title={isGuest ? `Guest Energy (max ${GUEST_MAX_ENERGY})` : "Energy"}>
              <span className="text-lg">🔋</span>
              <span>{displayEnergy}{isGuest && <span className="text-text-secondary font-bold">/{GUEST_MAX_ENERGY}</span>}</span>
            </div>

            {/* Streak — hidden for guests */}
            {!isGuest && (
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-red-500" title="Streak count">
                <Flame size={16} fill="currentColor" />
                <span>{streak}</span>
              </div>
            )}

            {/* Gems / Diamonds — hidden for guests */}
            {!isGuest && (
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-blue-500" title="Gems / Diamonds">
                <Gem size={15} fill="currentColor" />
                <span>{gems}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info("No new notifications")}
              className="p-2 border-2 border-border bg-surface rounded-xl text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              <Bell size={16} />
            </button>
            {isGuest ? (
              <div
                className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-surface-muted cursor-default flex items-center justify-center text-text-secondary shadow-[0_2px_0_#141827]"
                title="Guest"
              >
                <UserCircle2 size={22} strokeWidth={1.5} />
              </div>
            ) : (
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-primary cursor-pointer flex items-center justify-center font-black text-text-primary text-sm shadow-[0_2px_0_#141827]"
                title={user?.name || "Profile"}
              >
                {userInitial}
              </Link>
            )}
          </div>
        </div>

        {/* Guest login CTA card — shown instead of premium card */}
        {isGuest ? (
          <div className="bg-surface border-2.5 border-border rounded-2xl p-5 shadow-[0_4px_0_#141827] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-text-primary text-sm tracking-wide uppercase">Guest Mode</h3>
                <p className="text-xs font-bold text-text-secondary leading-relaxed">
                  You have <span className="text-text-primary font-black">{displayEnergy}/{GUEST_MAX_ENERGY} ⚡</span> energy left. Sign in to unlock the full experience.
                </p>
              </div>
              <div className="w-10 h-10 shrink-0 bg-primary border-2 border-border rounded-xl flex items-center justify-center shadow-[0_2px_0_#141827]">
                <LogIn size={18} className="text-text-primary" strokeWidth={2.5} />
              </div>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full text-center py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-extrabold text-xs tracking-wider shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              SIGN IN TO CONTINUE
            </button>
          </div>
        ) : (
          /* Try Premium Promo Card — authenticated only */
          <div className="bg-surface border-2 border-border rounded-2xl p-5 shadow-offset flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-[#FF9E2C] text-sm tracking-wide uppercase">Try Premium for free</h3>
                <p className="text-xs font-bold text-text-secondary">
                  Get up to 2 weeks free. Cancel anytime.
                </p>
              </div>
              <div className="w-10 h-10 shrink-0 bg-blue-50 border-2 border-border rounded-lg flex items-center justify-center">
                <Gem size={20} className="text-blue-500" fill="#3b82f6" />
              </div>
            </div>

            <button
              onClick={() => {
                toast.success("💎 Premium active! +100 bonus Gems granted.");
              }}
              className="w-full text-center py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-extrabold text-xs tracking-wider shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              START FREE TRIAL
            </button>
          </div>
        )}

        {/* Unlock Leaderboards Status Card — hidden for guests */}
        {!isGuest && (
          <div className="bg-surface border-2 border-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-text-secondary tracking-widest uppercase">Unlock Leaderboards</h3>

            <div className="flex flex-col items-center gap-3 py-2 text-center">
              {xp >= 30 ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#FFFDF6] border-2 border-border flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-extrabold text-text-primary">Rankings Unlocked!</span>
                    <span className="text-xs text-text-secondary">View standings under the Leaderboard tab.</span>
                  </div>
                  <Link
                    href="/leaderboards"
                    className="px-4 py-1.5 border-2 border-border rounded-lg text-xs font-bold hover:bg-bg-secondary transition-colors block"
                  >
                    VIEW LEADERBOARD
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-border-muted flex items-center justify-center text-text-secondary bg-bg-secondary">
                    <Lock size={20} />
                  </div>
                  <p className="text-xs text-text-secondary px-2">
                    Earn <span className="font-bold text-text-primary">{30 - xp} more XP</span> to start competing
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Daily Quests Card — authenticated users only; guests see a login nudge */}
        {isGuest ? (
          <div className="bg-surface border-2 border-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-text-secondary tracking-widest uppercase">Daily Quests</h3>
            <div className="flex flex-col items-center gap-3 py-3 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-border-muted flex items-center justify-center text-text-secondary bg-bg-secondary">
                <Lock size={20} />
              </div>
              <p className="text-xs text-text-secondary px-2 leading-relaxed">
                <span className="font-bold text-text-primary">Sign in</span> to access daily quests, earn XP, and win gem rewards.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-2 bg-primary text-text-primary border-2 border-border text-center text-xs font-black rounded-xl shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              SIGN IN
            </button>
          </div>
        ) : (
          <div className="bg-surface border-2 border-border rounded-2xl p-5 shadow-offset flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-text-secondary tracking-widest uppercase">Active Quests</h3>

            <div className="flex flex-col gap-4">
              {isQuestsLoading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-10 bg-bg-primary rounded-xl" />
                  <div className="h-10 bg-bg-primary rounded-xl" />
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
                                onError: (err: any) => {
                                  toast.error(err.message || "Failed to claim quest reward");
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
              ) : (
                <>
                  {/* Default Fallback Quest 1 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-yellow-500">
                        <Star size={16} fill={xp >= 50 ? "currentColor" : "none"} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                          <span>Earn 50 XP</span>
                          <span className="text-[#FF9E2C] font-extrabold">50 gems</span>
                        </div>
                        <span className="text-[10px] text-text-secondary font-bold">
                          {Math.min(xp, 50)} / 50 XP
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 border-r-2 border-border"
                        style={{ width: `${Math.min((xp / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Default Fallback Quest 2 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-yellow-500">
                        <Star size={16} fill={completedQuizzes >= 3 ? "currentColor" : "none"} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                          <span>Complete 3 Quizzes</span>
                          <span className="text-[#FF9E2C] font-extrabold">50 gems</span>
                        </div>
                        <span className="text-[10px] text-text-secondary font-bold">
                          {Math.min(completedQuizzes, 3)} / 3 Quizzes
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all duration-300 border-r-2 border-border"
                        style={{ width: `${Math.min((completedQuizzes / 3) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
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
        )}
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
