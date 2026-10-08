// features/auth/components/profile/EditProfileModal.tsx

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Search,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Sparkles,
  Building2,
  RotateCcw,
} from "lucide-react";
import { ACADEMIC_TRACKS, type CustomProfileState } from "@/features/auth/constants";
import type { AuthUser } from "@/features/auth/types";
import { useSchools } from "@/features/auth/hooks";

interface EditProfileModalProps {
  isOpen: boolean;
  editForm: CustomProfileState;
  authUser: AuthUser | null;
  onClose: () => void;
  onChange: (updated: CustomProfileState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUploadClick: () => void;
  isSaving?: boolean;
}

const GHANA_REGIONS = [
  "All Regions",
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Volta",
  "Northern",
  "Bono",
  "Bono East",
  "Ahafo",
  "Upper East",
  "Upper West",
  "Oti",
  "Savannah",
  "North East",
  "Western North",
];

export function EditProfileModal({
  isOpen,
  editForm,
  authUser,
  onClose,
  onChange,
  onSubmit,
  onUploadClick,
  isSaving = false,
}: EditProfileModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [isSchoolPickerOpen, setIsSchoolPickerOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const pickerDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query live SHS schools from NestJS backend
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchools({
    search: debouncedSearch,
    region: selectedRegion === "All Regions" ? undefined : selectedRegion,
    limit: 30,
  });

  const schoolsList = useMemo(() => {
    return schoolsData?.schools || [];
  }, [schoolsData]);

  // Handle clicking outside the school dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerDropdownRef.current &&
        !pickerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSchoolPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectSchool = (school: {
    id: string;
    name: string;
    shortCode: string;
    region?: string | null;
    crestUrl?: string | null;
  }) => {
    onChange({
      ...editForm,
      school: school.name,
      schoolId: school.id,
      schoolCrestUrl: school.crestUrl || null,
      schoolRegion: school.region || null,
      schoolShortCode: school.shortCode || null,
    });
    setIsSchoolPickerOpen(false);
    setIsCustomMode(false);
    setSearchQuery("");
  };

  const handleClearSchool = () => {
    onChange({
      ...editForm,
      school: "",
      schoolId: null,
      schoolCrestUrl: null,
      schoolRegion: null,
      schoolShortCode: null,
    });
    setIsCustomMode(false);
    setIsSchoolPickerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border-2.5 border-border rounded-2xl p-6 sm:p-7 shadow-offset flex flex-col gap-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
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
                Connect your Senior High School & academic credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center justify-between">
              <span>Student Name</span>
              <span className="text-[10px] font-bold text-text-secondary">Public Display</span>
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onChange({ ...editForm, name: e.target.value })}
              placeholder={authUser?.name || "e.g. Kwame Mensah"}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Ghanaian SHS School Selector */}
          <div className="flex flex-col gap-1.5 relative" ref={pickerDropdownRef}>
            <label className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Senior High School (SHS)</span>
                <span className="text-[10px] bg-primary/20 text-text-primary px-1.5 py-0.2 rounded font-black border border-border">
                  Ghana SHS Database
                </span>
              </span>
              {editForm.school && (
                <button
                  type="button"
                  onClick={handleClearSchool}
                  className="text-[11px] font-bold text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Change</span>
                </button>
              )}
            </label>

            {/* If a school is already selected, display the verified card */}
            {editForm.school && !isSchoolPickerOpen && !isCustomMode ? (
              <div className="p-3 rounded-xl border-2 border-border bg-bg-primary flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg border-2 border-border bg-primary/30 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-xs">
                    {editForm.schoolCrestUrl ? (
                      <Image
                        src={editForm.schoolCrestUrl}
                        alt={editForm.school}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="text-text-primary font-black uppercase">
                        {(editForm.schoolShortCode || editForm.school.slice(0, 3)).slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-text-primary truncate">
                        {editForm.school}
                      </h4>
                      {editForm.schoolShortCode && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary">
                          {editForm.schoolShortCode}
                        </span>
                      )}
                    </div>
                    {editForm.schoolRegion && (
                      <p className="text-[11px] font-bold text-text-secondary flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-text-secondary" />
                        <span>{editForm.schoolRegion} Region</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSchoolPickerOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs shrink-0 shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Switch
                </button>
              </div>
            ) : isCustomMode ? (
              /* Custom unlisted school input */
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) =>
                      onChange({
                        ...editForm,
                        school: e.target.value,
                        schoolId: null,
                        schoolCrestUrl: null,
                      })
                    }
                    placeholder="Enter custom or international school name"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setIsSchoolPickerOpen(true);
                    }}
                    className="px-3 py-2.5 rounded-xl border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs shrink-0 cursor-pointer"
                  >
                    Select Official
                  </button>
                </div>
                <p className="text-[11px] font-bold text-text-secondary">
                  Custom school names are not linked to national rankings.
                </p>
              </div>
            ) : (
              /* Searchable dropdown trigger and panel */
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSchoolPickerOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSchoolPickerOpen(true);
                    }}
                    placeholder="Search 700+ Ghana SHS (e.g. PRESEC, Achimota, OWASS)..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border-2 border-border bg-bg-primary text-text-primary font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSchoolPickerOpen((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isSchoolPickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isSchoolPickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-surface border-2.5 border-border rounded-xl shadow-offset overflow-hidden flex flex-col max-h-72">
                    {/* Region Filter Bar */}
                    <div className="p-2 border-b-2 border-border bg-bg-secondary flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-black rounded-lg border-2 border-border bg-surface text-text-primary outline-none cursor-pointer"
                      >
                        {GHANA_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Results List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-border/30">
                      {isLoadingSchools ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-text-secondary">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-xs font-bold">Querying SHS schools...</span>
                        </div>
                      ) : schoolsList.length > 0 ? (
                        schoolsList.map((school) => {
                          const isSelected = editForm.schoolId === school.id;
                          return (
                            <button
                              key={school.id}
                              type="button"
                              onClick={() => handleSelectSchool(school)}
                              className={`w-full text-left p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-primary/10 transition-colors cursor-pointer ${
                                isSelected ? "bg-primary/20 font-black" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg border-2 border-border bg-surface flex items-center justify-center text-xs font-black shrink-0 overflow-hidden">
                                  {school.crestUrl ? (
                                    <Image
                                      src={school.crestUrl}
                                      alt={school.name}
                                      width={32}
                                      height={32}
                                      unoptimized
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[11px] font-black">
                                      {(school.shortCode || "SHS").slice(0, 3)}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-text-primary truncate block">
                                      {school.name}
                                    </span>
                                    {school.shortCode && (
                                      <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-surface border border-border text-text-secondary shrink-0">
                                        {school.shortCode}
                                      </span>
                                    )}
                                  </div>
                                  {school.region && (
                                    <span className="text-[10px] font-bold text-text-secondary block">
                                      {school.region} Region
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-primary border-2 border-border flex items-center justify-center text-text-primary shrink-0">
                                  <Check className="w-3 h-3 stroke-3" />
                                </div>
                              ) : null}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-text-secondary flex flex-col items-center gap-1.5">
                          <Building2 className="w-6 h-6 text-text-muted" />
                          <span className="text-xs font-bold">
                            No schools matched &quot;{debouncedSearch}&quot;
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomMode(true);
                              setIsSchoolPickerOpen(false);
                            }}
                            className="mt-1 text-xs font-black text-primary hover:underline cursor-pointer"
                          >
                            Enter custom / unlisted school name
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer for unlisted school option */}
                    <div className="p-2 border-t-2 border-border bg-bg-secondary flex items-center justify-between text-xs font-bold text-text-secondary">
                      <span>Don&apos;t see your school?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomMode(true);
                          setIsSchoolPickerOpen(false);
                        }}
                        className="font-black text-text-primary hover:underline cursor-pointer"
                      >
                        Enter manually →
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              <div className="w-11 h-11 rounded-full border-2 border-border bg-primary/40 flex items-center justify-center font-black text-sm overflow-hidden shrink-0 shadow-xs">
                {editForm.avatarUrl ? (
                  <Image
                    src={editForm.avatarUrl}
                    alt="Avatar preview"
                    width={44}
                    height={44}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(editForm.name || "ST").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="text-xs font-black block text-text-primary flex items-center gap-1.5">
                  <span>Profile Photo</span>
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                </span>
                <span className="text-[11px] font-bold text-text-secondary">
                  PNG, JPG up to 2MB (Cloud Storage)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onUploadClick}
              className="px-3.5 py-1.5 rounded-lg border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
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
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border-2 border-border bg-surface hover:bg-surface-muted text-text-primary font-black text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs sm:text-sm shadow-[0_2.5px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
