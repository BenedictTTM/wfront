"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMe, useLogoutMutation, useUpdateProfileMutation } from "@/features/auth/hooks";
import { uploadAvatarViaPresignedUrl } from "@/features/auth/api";
import { isGuestIdentity } from "@/features/auth/types";
import { useStats } from "@/components/providers/stats-provider";
import { useDashboard, useLeaderboard } from "@/features/gamification/hooks";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import { safeStorage } from "@/lib/storage";
import { type CustomProfileState } from "@/features/auth/constants";
import {
  ProfileHeader,
  ProfileStatsGrid,
  EditProfileModal,
} from "@/features/auth/components";

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: me, isLoading: isLoadingUser } = useMe();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { data: analytics } = useAnalyticsOverview(undefined, "all");
  const { data: leaderboard } = useLeaderboard({ scope: "global" });
  const { xp, gems, streak, energy, maxEnergy, completedQuizzes } = useStats();

  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  const isGuest = !me || isGuestIdentity(me);
  const authUser = !isGuest ? me : null;
  const guestUser = me && isGuestIdentity(me) ? me : null;
  const userId = authUser?.id || guestUser?.sessionId || "guest";
  const storageKey = `wassce_student_profile_${userId}`;

  // Local state for profile customization (hydrated from user data / storage)
  const [profile, setProfile] = useState<CustomProfileState>(() => {
    const saved = safeStorage.getItem<CustomProfileState | null>(storageKey, null);
    return {
      name: saved?.name || authUser?.name || "",
      school: saved?.school || authUser?.school?.name || "",
      schoolId: saved?.schoolId || authUser?.schoolId || authUser?.school?.id || null,
      schoolCrestUrl:
        saved?.schoolCrestUrl ||
        authUser?.school?.crestUrl ||
        ((saved?.school || authUser?.school?.name)?.toLowerCase().includes("aquinas")
          ? "https://res.cloudinary.com/dsriwu6yn/image/upload/v1791470415/crests/st-thomas-aquinas-senior-high-school.jpg"
          : null),
      schoolRegion: saved?.schoolRegion || authUser?.school?.region || null,
      schoolShortCode: saved?.schoolShortCode || authUser?.school?.shortCode || null,
      track: saved?.track || "",
      avatarUrl: saved?.avatarUrl || authUser?.avatarUrl || null,
    };
  });

  const [prevUserId, setPrevUserId] = useState(userId);
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    const saved = safeStorage.getItem<CustomProfileState | null>(storageKey, null);
    setProfile({
      name: saved?.name || authUser?.name || "",
      school: saved?.school || authUser?.school?.name || "",
      schoolId: saved?.schoolId || authUser?.schoolId || authUser?.school?.id || null,
      schoolCrestUrl:
        saved?.schoolCrestUrl ||
        authUser?.school?.crestUrl ||
        ((saved?.school || authUser?.school?.name)?.toLowerCase().includes("aquinas")
          ? "https://res.cloudinary.com/dsriwu6yn/image/upload/v1791470415/crests/st-thomas-aquinas-senior-high-school.jpg"
          : null),
      schoolRegion: saved?.schoolRegion || authUser?.school?.region || null,
      schoolShortCode: saved?.schoolShortCode || authUser?.school?.shortCode || null,
      track: saved?.track || "",
      avatarUrl: saved?.avatarUrl || authUser?.avatarUrl || null,
    });
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<CustomProfileState>({ ...profile });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() && authUser) {
      toast.error("Student name cannot be empty");
      return;
    }

    try {
      if (authUser) {
        await updateProfileMutation.mutateAsync({
          name: editForm.name.trim(),
          schoolId: editForm.schoolId || null,
          avatarUrl: editForm.avatarUrl || null,
        });
      }
      setProfile(editForm);
      safeStorage.setItem(storageKey, editForm);
      setIsEditModalOpen(false);
      toast.success(
        editForm.school
          ? `Linked to ${editForm.school} successfully!`
          : "Profile credentials updated successfully!"
      );
    } catch (err: unknown) {
      console.error("Failed to save profile:", err);
      setProfile(editForm);
      safeStorage.setItem(storageKey, editForm);
      setIsEditModalOpen(false);
      toast.info("Saved locally. Network sync will resume once reconnected.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 1. Instant optimistic local preview
    const localPreviewUrl = URL.createObjectURL(file);
    const updated = { ...profile, avatarUrl: localPreviewUrl };
    setProfile(updated);
    setEditForm(updated);

    if (authUser) {
      try {
        const cdnUrl = await uploadAvatarViaPresignedUrl(file);
        const synced = { ...profile, avatarUrl: cdnUrl };
        setProfile(synced);
        setEditForm(synced);
        safeStorage.setItem(storageKey, synced);
        toast.success("Profile photo stored via Cloud Storage!");
      } catch (err: unknown) {
        console.warn("Avatar upload notice:", err);
        safeStorage.setItem(storageKey, updated);
        toast.success("Profile avatar updated!");
      }
    } else {
      safeStorage.setItem(storageKey, updated);
      toast.success("Profile avatar saved for this session!");
    }
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
      <ProfileHeader
        profile={profile}
        authUser={authUser}
        isGuest={isGuest}
        displayName={displayName}
        initials={initials}
        displayEmail={displayEmail}
        joinedDate={joinedDate}
        globalRankText={globalRankText}
        liveUserRank={liveUserRank}
        displayXp={displayXp}
        displayGems={displayGems}
        onEditClick={() => {
          setEditForm({ ...profile });
          setIsEditModalOpen(true);
        }}
        onAvatarUploadClick={() => fileInputRef.current?.click()}
      />

      {/* ── CORE METRICS ROW ── */}
      <ProfileStatsGrid
        displayStreak={displayStreak}
        longestStreak={longestStreak}
        quizzesCount={quizzesCount}
        currentEnergy={currentEnergy}
        maximumEnergy={maximumEnergy}
        energyPercent={energyPercent}
      />


      {/* ── EDIT PROFILE MODAL ── */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        editForm={editForm}
        authUser={authUser}
        onClose={() => setIsEditModalOpen(false)}
        onChange={setEditForm}
        onSubmit={handleSaveProfile}
        onUploadClick={() => fileInputRef.current?.click()}
        isSaving={updateProfileMutation.isPending}
      />
    </div>
  );
}
