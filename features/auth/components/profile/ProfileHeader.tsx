// features/auth/components/profile/ProfileHeader.tsx

"use client";

import React from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Camera,
  Edit3,
  School as SchoolIcon,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import type { CustomProfileState } from "@/features/auth/constants";

interface ProfileHeaderProps {
  profile: CustomProfileState;
  authUser: AuthUser | null;
  isGuest: boolean;
  displayName: string;
  initials: string;
  displayEmail: string | null;
  joinedDate: string | null;
  globalRankText: string;
  liveUserRank: number | undefined;
  displayXp: string;
  displayGems: string;
  onEditClick: () => void;
  onAvatarUploadClick: () => void;
}

export function ProfileHeader({
  profile,
  authUser,
  isGuest,
  displayName,
  initials,
  displayEmail,
  joinedDate,
  globalRankText,
  liveUserRank,
  displayXp,
  displayGems,
  onEditClick,
  onAvatarUploadClick,
}: ProfileHeaderProps) {
  return (
    <div className="border-2.5 border-border bg-surface rounded-2xl p-5 sm:p-7 shadow-offset flex flex-col gap-6 relative">
      {/* Top Details Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div className="flex items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar with Upload trigger */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2.5 border-border bg-primary/40 flex items-center justify-center font-black text-2xl sm:text-3xl text-text-primary shadow-[0_4px_0_#141827] overflow-hidden select-none">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={displayName}
                  width={96}
                  height={96}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              type="button"
              onClick={onAvatarUploadClick}
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
                <span className="inline-flex items-center gap-2 bg-bg-secondary px-2.5 py-1 rounded-lg border border-border shadow-xs">
                  {profile.schoolCrestUrl ? (
                    <Image
                      src={profile.schoolCrestUrl}
                      alt={profile.school}
                      width={18}
                      height={18}
                      unoptimized
                      className="w-4.5 h-4.5 object-contain shrink-0 rounded"
                    />
                  ) : (
                    <SchoolIcon className="w-3.5 h-3.5 text-text-primary shrink-0" />
                  )}
                  <span>{profile.school}</span>
                  {profile.schoolRegion && (
                    <span className="text-[10px] font-bold text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/60">
                      {profile.schoolRegion}
                    </span>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onEditClick}
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
                  onClick={onEditClick}
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
          onClick={onEditClick}
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
  );
}
