"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Camera,
  Edit3,
  Globe,
  Award,
  ArrowRight,
  School as SchoolIcon,
  X,
  Upload,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useMe, useLogoutMutation } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useStats } from "@/components/providers/stats-provider";
import { useDashboard, useLeaderboard } from "@/features/gamification/hooks";
import { useAnalyticsOverview } from "@/features/analytics/hooks";

const POPULAR_SCHOOLS = [
  "Achimota School",
  "Presbyterian Boys' Secondary School (PRESEC)",
  "Wesley Girls' High School",
  "Mfantsipim School",
  "Opoku Ware School",
  "Prempeh College",
  "Holy Child School",
  "St. Augustine's College",
  "Aburi Girls' Senior High School",
  "St. Peter's Boys' Senior High School",
  "Accra Academy",
  "Koforidua Senior High Technical School",
  "Yaa Asantewaa Girls' Senior High School",
  "Tamale Senior High School",
  "Ghana National College",
];

const ACADEMIC_TRACKS = [
  "General Science Track",
  "General Arts Track",
  "Business Track",
  "Visual Arts Track",
  "Home Economics Track",
  "Agricultural Science Track",
  "Technical Track",
];

interface CustomProfileState {
  name: string;
  school: string;
  track: string;
  avatarUrl?: string | null;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: me, isLoading: isLoadingUser } = useMe();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { data: analytics } = useAnalyticsOverview(undefined, "all");
  const { data: leaderboard } = useLeaderboard({ scope: "global" });
  const { xp, gems, streak, energy, maxEnergy, completedQuizzes } = useStats();

  const logoutMutation = useLogoutMutation();

  const isGuest = !me || isGuestIdentity(me);
  const authUser = !isGuest ? me : null;
  const guestUser = me && isGuestIdentity(me) ? me : null;
  const userId = authUser?.id || guestUser?.sessionId || "guest";

  // Local state for profile customization (persisted per user/session in localStorage)
  const [profile, setProfile] = useState<CustomProfileState>({
    name: "",
    school: "",
    track: "",
    avatarUrl: null,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<CustomProfileState>({ ...profile });

  // Sync with authUser & load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `wassce_student_profile_${userId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          name: parsed.name || authUser?.name || prev.name || "",
        }));
        setEditForm((prev) => ({
          ...prev,
          ...parsed,
          name: parsed.name || authUser?.name || prev.name || "",
        }));
        return;
      } catch (err) {
        console.error("Failed to parse saved profile", err);
      }
    }

    if (authUser?.name) {
      setProfile((prev) => ({ ...prev, name: authUser.name || "" }));
      setEditForm((prev) => ({ ...prev, name: authUser.name || "" }));
    }
  }, [userId, authUser?.name]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() && authUser) {
      toast.error("Student name cannot be empty");
      return;
    }
    setProfile(editForm);
    if (typeof window !== "undefined") {
      localStorage.setItem(`wassce_student_profile_${userId}`, JSON.stringify(editForm));
    }
    setIsEditModalOpen(false);
    toast.success("Profile credentials updated successfully!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...profile, avatarUrl: result };
      setProfile(updated);
      setEditForm(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`wassce_student_profile_${userId}`, JSON.stringify(updated));
      }
      toast.success("Profile avatar updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
      toast.error("Logout encountered an issue. Redirecting...");
      router.push("/login");
    }
  };

  const isLoading = isLoadingUser || isLoadingDashboard;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
            <div className="h-4 w-72 bg-surface-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-surface-muted rounded-xl animate-pulse border-2 border-border" />
        </div>
        <div className="border-2.5 border-border bg-surface rounded-2xl p-7 shadow-offset flex flex-col gap-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-border bg-surface-muted" />
            <div className="flex flex-col gap-2.5 flex-1">
              <div className="h-6 w-48 bg-surface-muted rounded-md" />
              <div className="h-4 w-64 bg-surface-muted rounded-md" />
            </div>
          </div>
          <div className="h-14 w-full bg-surface-muted rounded-xl border-2 border-border-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Authentic display parameters
  const displayName =
    profile.name.trim() ||
    authUser?.name ||
    (authUser?.email ? authUser.email.split("@")[0] : "Guest Student");

  const displayEmail = authUser?.email || null;

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || (isGuest ? "GS" : "ST");

  const rawCreatedAt = authUser?.createdAt || guestUser?.createdAt;
  const joinedDate = rawCreatedAt
    ? new Date(rawCreatedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  // Genuine Stats bindings
  const displayXp = (xp ?? dashboard?.xp?.total ?? dashboard?.xp?.current ?? 0).toLocaleString();
  const displayGems = (gems ?? dashboard?.wallet?.gems ?? 0).toLocaleString();
  const displayStreak = streak ?? dashboard?.streak?.current ?? 0;
  const longestStreak = dashboard?.streak?.longest ?? displayStreak;

  // Real Quizzes count from analytics overview or stats provider
  const quizzesCount =
    analytics?.snapshot?.quizzesCompleted ??
    (completedQuizzes > 0 ? completedQuizzes : 0);

  // Energy
  const currentEnergy = energy ?? dashboard?.energy?.current ?? 0;
  const maximumEnergy = maxEnergy ?? dashboard?.energy?.max ?? 30;
  const energyPercent =
    maximumEnergy > 0 ? Math.min(100, Math.max(0, (currentEnergy / maximumEnergy) * 100)) : 0;

  // Genuine Global & School ranks
  const liveUserRank = leaderboard?.currentUserEntry?.rank;
  const globalRankText = liveUserRank ? `#${liveUserRank.toLocaleString()}` : "Unranked";

  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      {/* ── Hidden File Input for Avatar Upload ── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2.5 border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm font-bold text-text-secondary mt-1">
            {isGuest
              ? "Your local guest session credentials and study achievements"
              : "Manage your academic identity, school credentials, and global standing"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isGuest ? (
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2.5 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm transition-all shadow-[0_3px_0_#141827] active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 text-text-secondary" />
              )}
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2.5 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs sm:text-sm transition-all shadow-[0_3px_0_#141827] active:translate-y-0.5 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Guest Session Banner ── */}
      {isGuest && (
        <div className="border-2.5 border-border bg-amber-500/10 rounded-2xl p-4 sm:p-5 shadow-offset flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 border-2 border-border mt-0.5 shadow-[0_2px_0_#141827] shrink-0">
              <UserPlus className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-text-primary">
                  Guest Session Active
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-200 border border-border rounded-md text-text-primary">
                  Temporary
                </span>
              </div>
              <p className="text-xs font-bold text-text-secondary mt-0.5 leading-relaxed">
                Your study streak, XP, and quiz history are saved locally on this browser. Create a permanent account to sync progress across devices and compete on national school leaderboards.
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

      {/* ── MAIN IDENTITY CARD ── */}
      <div className="border-2.5 border-border bg-surface rounded-2xl p-5 sm:p-7 shadow-offset flex flex-col gap-6 relative">
        {/* Top Details Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Upload trigger */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2.5 border-border bg-primary/40 flex items-center justify-center font-black text-2xl sm:text-3xl text-text-primary shadow-[0_4px_0_#141827] overflow-hidden select-none">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile avatar"
                title="Upload profile photo"
                className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-surface hover:bg-primary border-2 border-border p-2 rounded-full shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all text-text-primary cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Profile Credentials */}
            <div className="flex flex-col gap-2 min-w-0">
              {/* Name & Status Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate">
                  {displayName}
                </h2>

                {/* Role / Entitlement Badge */}
                {!isGuest ? (
                  authUser?.entitlementActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black bg-emerald-400 text-text-primary border-2 border-border px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_1.5px_0_#141827]">
                      <CheckCircle2 className="w-3 h-3 text-text-primary" />
                      PRO SUBSCRIBER
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black bg-surface-muted text-text-primary border-2 border-border px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_1.5px_0_#141827]">
                      <User className="w-3 h-3 text-text-secondary" />
                      STUDENT
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black bg-amber-300 text-text-primary border-2 border-border px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_1.5px_0_#141827]">
                    GUEST
                  </span>
                )}
              </div>

              {/* Email & Joined Date */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary flex-wrap">
                {displayEmail ? (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{displayEmail}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <Mail className="w-3.5 h-3.5 text-text-muted" />
                    <span>Unlinked Email</span>
                  </span>
                )}

                {joinedDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Active since {joinedDate}</span>
                    </span>
                  </>
                )}
              </div>

              {/* School & Track */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-text-primary mt-0.5 flex-wrap">
                {profile.school ? (
                  <span className="flex items-center gap-1.5 bg-bg-secondary px-2.5 py-1 rounded-lg border border-border">
                    <SchoolIcon className="w-3.5 h-3.5 text-text-primary shrink-0" />
                    <span>{profile.school}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({ ...profile });
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-bg-secondary/70 hover:bg-bg-secondary text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-lg border border-dashed border-border transition-colors cursor-pointer text-xs"
                  >
                    <SchoolIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>+ Set Secondary School</span>
                  </button>
                )}

                {profile.track ? (
                  <>
                    <span className="text-border">•</span>
                    <span className="bg-bg-secondary px-2.5 py-1 rounded-lg border border-border text-text-secondary font-bold">
                      {profile.track}
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({ ...profile });
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-bg-secondary/70 hover:bg-bg-secondary text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-lg border border-dashed border-border transition-colors cursor-pointer text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>+ Set Academic Track</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={() => {
              setEditForm({ ...profile });
              setIsEditModalOpen(true);
            }}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-text-secondary" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* ── Standings Banner ── */}
        <div className="border-2 border-border bg-bg-secondary/60 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-black text-text-primary shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-base sm:text-lg">🌍</span>
            <span>
              Global Standing:{" "}
              <span className="text-text-primary underline decoration-primary decoration-2 underline-offset-2">
                {globalRankText}
              </span>
            </span>
          </div>

          <div className="hidden sm:block h-4 w-0.5 bg-border/25" />

          <div className="flex items-center gap-2.5">
            <span className="text-base sm:text-lg">🏆</span>
            <span>
              School Rank:{" "}
              {profile.school ? (
                <span className="text-text-primary">
                  {liveUserRank ? `#${liveUserRank}` : "Competing"} at {profile.school}
                </span>
              ) : (
                <span className="text-text-secondary font-bold">
                  Set school to join school rank
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ── XP & Gems Pill Badges ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-black text-xs sm:text-sm shadow-[0_2px_0_#141827]">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>XP: {displayXp}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-black text-xs sm:text-sm shadow-[0_2px_0_#141827]">
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-400" />
            <span>Gems: {displayGems}</span>
          </div>
        </div>
      </div>

      {/* ── CORE METRICS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Active Streak Card */}
        <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
              ACTIVE STREAK
            </span>
            <span className="text-lg">🔥</span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {displayStreak} {displayStreak === 1 ? "Day" : "Days"}
            </div>
            <div className="text-xs font-bold text-text-secondary mt-1">
              Best record: {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </div>
          </div>
        </div>

        {/* Quizzes Completed Card */}
        <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
              QUIZZES COMPLETED
            </span>
            <span className="text-lg">⭐</span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
            </div>
            <div className="mt-2.5">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-border bg-primary/20 hover:bg-primary text-text-primary font-black text-xs transition-all shadow-[0_2px_0_#141827] active:translate-y-0.5"
              >
                <span>View Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Daily Energy Card */}
        <div className="p-5 border-2.5 border-border bg-surface rounded-2xl shadow-offset flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">
              DAILY ENERGY
            </span>
            <span className="text-lg">⚡</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                {currentEnergy} / {maximumEnergy}
              </div>
              <span className="text-xs font-black text-text-secondary">
                {Math.round(energyPercent)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-muted border-2 border-border rounded-full h-3 overflow-hidden my-2">
              <div
                className="h-full bg-primary border-r-2 border-border transition-all duration-500"
                style={{ width: `${energyPercent}%` }}
              />
            </div>

            <div className="text-xs font-bold text-text-secondary">
              Refills daily for test preparation
            </div>
          </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border-2.5 border-border rounded-2xl p-6 sm:p-7 shadow-offset flex flex-col gap-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border flex items-center justify-center font-black text-base shadow-[0_2px_0_#141827]">
                  🎓
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary">
                    Edit Student Credentials
                  </h3>
                  <p className="text-xs font-bold text-text-secondary">
                    Update your school, academic track, and display name
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-text-primary">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder={authUser?.name || "e.g. Kwame Mensah"}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              {/* School */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-text-primary">
                  Secondary School
                </label>
                <select
                  value={
                    !editForm.school
                      ? ""
                      : POPULAR_SCHOOLS.includes(editForm.school)
                      ? editForm.school
                      : "Other"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setEditForm({ ...editForm, school: "" });
                    } else {
                      setEditForm({ ...editForm, school: val });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="">Select your Secondary School...</option>
                  {POPULAR_SCHOOLS.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                  <option value="Other">Other (Type Custom School)</option>
                </select>

                {editForm.school !== "" && !POPULAR_SCHOOLS.includes(editForm.school) && (
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                    placeholder="Enter custom school name"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                )}
              </div>

              {/* Track */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-text-primary">
                  Academic Track / Program
                </label>
                <select
                  value={editForm.track}
                  onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="">Select your Academic Track...</option>
                  {ACADEMIC_TRACKS.map((trk) => (
                    <option key={trk} value={trk}>
                      {trk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Upload in modal */}
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-border bg-bg-secondary mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-border bg-primary/40 flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
                    {editForm.avatarUrl ? (
                      <img
                        src={editForm.avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{(editForm.name || "ST").slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black block text-text-primary">
                      Profile Picture
                    </span>
                    <span className="text-[11px] font-bold text-text-secondary">
                      PNG, JPG up to 2MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs sm:text-sm shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
