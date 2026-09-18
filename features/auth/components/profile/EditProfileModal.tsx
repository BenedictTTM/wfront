// features/auth/components/profile/EditProfileModal.tsx

"use client";

import React from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { POPULAR_SCHOOLS, ACADEMIC_TRACKS, type CustomProfileState } from "@/features/auth/constants";
import type { AuthUser } from "@/features/auth/types";

interface EditProfileModalProps {
  isOpen: boolean;
  editForm: CustomProfileState;
  authUser: AuthUser | null;
  onClose: () => void;
  onChange: (updated: CustomProfileState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUploadClick: () => void;
}

export function EditProfileModal({
  isOpen,
  editForm,
  authUser,
  onClose,
  onChange,
  onSubmit,
  onUploadClick,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-text-primary">
              Student Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onChange({ ...editForm, name: e.target.value })}
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
                  onChange({ ...editForm, school: "" });
                } else {
                  onChange({ ...editForm, school: val });
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
                onChange={(e) => onChange({ ...editForm, school: e.target.value })}
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
              onChange={(e) => onChange({ ...editForm, track: e.target.value })}
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
                  <Image
                    src={editForm.avatarUrl}
                    alt="Avatar preview"
                    width={40}
                    height={40}
                    unoptimized
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
              onClick={onUploadClick}
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
              onClick={onClose}
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
  );
}
