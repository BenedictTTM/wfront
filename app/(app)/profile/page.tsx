"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Flame,
  Trophy,
  Zap,
  Sparkles,
  Calendar,
  UserPlus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useMe, useLogoutMutation } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useStats } from "@/components/providers/stats-provider";
import { useDashboard } from "@/features/gamification/hooks";

export default function StudentProfilePage() {
  const router = useRouter();
  const { data: me, isLoading: isLoadingUser } = useMe();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { xp, gems, streak, energy, maxEnergy, completedQuizzes } = useStats();

  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isLoading = isLoadingUser || isLoadingDashboard;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
        <div className="h-8 w-48 bg-surface-muted rounded-md animate-pulse border border-border-muted" />
        <div className="border-2 border-border bg-surface rounded-xl p-6 shadow-offset flex items-center gap-6 animate-pulse">
          <div className="w-16 h-16 rounded-full border-2 border-border bg-surface-muted" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-6 w-36 bg-surface-muted rounded-md" />
            <div className="h-4 w-48 bg-surface-muted rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border-2 border-border bg-surface rounded-xl shadow-offset h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const isGuest = !me || isGuestIdentity(me);
  const authUser = !isGuest ? me : null;

  const displayName = authUser
    ? authUser.name || authUser.email.split("@")[0]
    : "Guest Learner";

  const initial = displayName.charAt(0).toUpperCase();

  const joinedDate = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Student Profile
          </h2>
          <p className="text-xs font-bold text-text-secondary mt-0.5">
            Manage your account details and learning achievements
          </p>
        </div>

        {!isGuest && (
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-border bg-surface hover:bg-surface-muted font-extrabold text-xs transition-colors shadow-[0_2px_0_#141827] active:translate-y-0.5 disabled:opacity-50"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5 text-text-secondary" />
            )}
            Sign Out
          </button>
        )}
      </div>

      {/* Guest Notice Banner */}
      {isGuest && (
        <div className="border-2 border-border bg-primary/20 rounded-xl p-5 shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary border-2 border-border mt-0.5">
              <UserPlus className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-text-primary">
                You are studying as a Guest
              </h3>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">
                Create an account to save your XP, track quiz history across devices, and unlock leaderboard rankings.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="w-full md:w-auto px-4 py-2 rounded-lg border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-extrabold text-xs text-center transition-all shadow-[0_2px_0_#141827] whitespace-nowrap"
          >
            Register / Sign In
          </Link>
        </div>
      )}

      {/* Profile Card */}
      <div className="border-2 border-border bg-surface rounded-xl p-6 shadow-offset flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full border-2 border-border bg-primary flex items-center justify-center font-black text-text-primary text-2xl select-none shadow-[0_3px_0_#141827]">
            {initial}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-text-primary">
                {displayName}
              </h3>
              {authUser?.entitlementActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 border-2 border-border px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PRO Member
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary flex-wrap">
              {authUser ? (
                <>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {authUser.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {authUser.role}
                  </span>
                  {joinedDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {joinedDate}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Temporary Guest Session ({me && isGuestIdentity(me) && me.sessionId ? me.sessionId.slice(0, 8) : "Active"})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-extrabold bg-surface-muted border-2 border-border px-2.5 py-0.5 rounded-full text-[#E28743] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> XP: {xp}
              </span>
              <span className="text-xs font-extrabold bg-surface-muted border-2 border-border px-2.5 py-0.5 rounded-full text-blue-600 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Gems: {gems}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">
              Active Streak
            </span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-extrabold text-red-500">
            🔥 {streak} Days
          </span>
          <span className="text-[11px] font-semibold text-text-secondary">
            Keep practicing daily to build your streak
          </span>
        </div>

        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">
              Quizzes Completed
            </span>
            <Trophy className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-blue-500">
            ⭐ {completedQuizzes} Quizzes
          </span>
          <span className="text-[11px] font-semibold text-text-secondary">
            Total completed practice sessions
          </span>
        </div>

        <div className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_3px_0_#141827] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-text-secondary tracking-wider uppercase">
              Daily Energy
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-500">
            ⚡ {energy} / {maxEnergy}
          </span>
          <span className="text-[11px] font-semibold text-text-secondary">
            Energy resets automatically every 24 hours
          </span>
        </div>
      </div>
    </div>
  );
}

