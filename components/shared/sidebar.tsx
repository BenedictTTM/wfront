"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser, useLogoutMutation } from "@/features/auth/hooks";

// ─── Normal Custom SVG Icons (Gamified, Thick Outlines, Tactile Fills) ────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3.5L21 10.5V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10.5Z" fill={active ? "#F6D86B" : "none"} />
      <path d="M9 21V13C9 12.4 9.4 12 10 12H14C14.6 12 15 12.4 15 13V21" fill={active ? "#FFFFFF" : "none"} />
    </svg>
  );
}

function StudyIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5C6.5 18.2 9.5 18.2 12 19.5C14.5 18.2 17.5 18.2 20 19.5V5.5C17.5 4.2 14.5 4.2 12 5.5C9.5 4.2 6.5 4.2 4 5.5V19.5Z" fill={active ? "#F6D86B" : "none"} />
      <line x1="12" y1="5.5" x2="12" y2="19.5" />
      {active && (
        <path d="M14 5.5V11L15.5 9.5L17 11V5.5" fill="#C8D4CF" stroke="#141827" strokeWidth="1.6" />
      )}
    </svg>
  );
}

function LeaderboardIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4H17V9.5C17 12.5 14.8 15 12 15C9.2 15 7 12.5 7 9.5V4Z" fill={active ? "#F6D86B" : "none"} />
      <path d="M7 6H4.5C3.7 6 3 6.7 3 7.5C3 9.5 4.5 11 7 11" />
      <path d="M17 6H19.5C20.3 6 21 6.7 21 7.5C21 9.5 19.5 11 17 11" />
      <path d="M12 15V19" />
      <path d="M8 19H16M7 21H17" />
      {active && <circle cx="12" cy="9.5" r="1.5" fill="#FFFFFF" />}
    </svg>
  );
}

function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="13" width="4.5" height="8" rx="1.5" fill={active ? "#C8D4CF" : "none"} />
      <rect x="9.75" y="8" width="4.5" height="13" rx="1.5" fill={active ? "#FFF3CC" : "none"} />
      <rect x="15.5" y="4" width="4.5" height="17" rx="1.5" fill={active ? "#F6D86B" : "none"} />
    </svg>
  );
}

function AchievementsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14L6 21L12 18.5L18 21L15.5 14" fill={active ? "#C8D4CF" : "none"} />
      <circle cx="12" cy="9" r="6" fill={active ? "#F6D86B" : "none"} />
      {active ? (
        <path d="M12 6.5L12.8 8.2L14.7 8.4L13.3 9.8L13.7 11.7L12 10.7L10.3 11.7L10.7 9.8L9.3 8.4L11.2 8.2L12 6.5Z" fill="#FFFFFF" stroke="#141827" strokeWidth="1" />
      ) : (
        <circle cx="12" cy="9" r="2.5" />
      )}
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#141827" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7.5" r="4" fill={active ? "#F6D86B" : "none"} />
      <path d="M4.5 20.5C4.5 16.5 8 14.5 12 14.5C16 14.5 19.5 16.5 19.5 20.5" fill={active ? "#C8D4CF" : "none"} />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function HelpCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function LogInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function LogOutIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({ 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: SidebarProps) {
  const [language, setLanguage] = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = useCurrentUser();
  const isGuest = !user;
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("You've been signed out. See you next time! 👋");
        router.push("/login");
      },
      onError: () => {
        // Best-effort: cookies are already cleared by the proxy, redirect anyway
        toast.info("Signed out.");
        router.push("/login");
      },
    });
  };

  // Resolve active tab based on current pathname
  let activeTab = "home";
  if (pathname.startsWith("/dashboard")) activeTab = "home";
  else if (pathname.startsWith("/study")) activeTab = "study";
  else if (pathname.startsWith("/leaderboards")) activeTab = "leaderboard";
  else if (pathname.startsWith("/analytics")) activeTab = "analytics";
  else if (pathname.startsWith("/achievements")) activeTab = "achievements";
  else if (pathname.startsWith("/profile")) activeTab = "profile";

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r-3 border-border flex flex-col justify-between py-6 px-4
      transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen overflow-y-auto
      ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      <div className="flex flex-col gap-8">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="relative w-10 h-10 shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="18" fill="#F6D86B" stroke="#141827" strokeWidth="2.5" />
              <rect x="11" y="14" width="18" height="15" rx="5" fill="#d68d50" stroke="#141827" strokeWidth="2.5" />
              <rect x="14" y="20" width="12" height="9" rx="3" fill="#c37d43" stroke="#141827" strokeWidth="2" />
              <circle cx="20" cy="22" r="1.2" fill="#141827" />
              <circle cx="16" cy="18" r="1.2" fill="#141827" />
              <circle cx="24" cy="18" r="1.2" fill="#141827" />
              <ellipse cx="20" cy="13" rx="5" ry="1.5" fill="#a06030" stroke="#141827" strokeWidth="1.5" />
              <path d="M 17.5 13 L 18 10 C 18 9, 22 9, 22 10 L 22.5 13 Z" fill="#a06030" stroke="#141827" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-text-primary">Panda</span>
          <button 
            className="lg:hidden ml-auto p-1 border-2 border-border rounded-md hover:bg-surface-muted cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CloseIcon className="w-4 h-4 text-text-primary" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "home" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <HomeIcon active={activeTab === "home"} />
            <span>HOME</span>
          </Link>

          <Link
            href="/study"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "study" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <StudyIcon active={activeTab === "study"} />
            <span>STUDY</span>
          </Link>

          <Link
            href="/leaderboards"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "leaderboard" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <LeaderboardIcon active={activeTab === "leaderboard"} />
            <span>LEADERBOARD</span>
          </Link>

          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "analytics" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <AnalyticsIcon active={activeTab === "analytics"} />
            <span>ANALYTICS</span>
          </Link>

          <Link
            href="/achievements"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "achievements" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <AchievementsIcon active={activeTab === "achievements"} />
            <span>ACHIEVEMENTS</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "profile" 
                ? "bg-[#FFFDF6] text-text-primary border-border shadow-[0_3px_0_#141827] translate-y-[-1px] active:translate-y-[1.5px] active:shadow-[0_1px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <ProfileIcon active={activeTab === "profile"} />
            <span>PROFILE</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="flex flex-col gap-4 pt-4 border-t border-border-muted">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-surface border-2 border-border rounded-xl text-sm font-semibold hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-text-secondary" />
              <span>{language}</span>
            </div>
            <ChevronDownIcon className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${showLangDropdown ? "rotate-180" : ""}`} />
          </button>

          {showLangDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border-2 border-border rounded-xl shadow-offset py-1 z-10">
              {["English", "French", "Twi", "Yoruba"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangDropdown(false);
                    toast.info(`Language switched to ${lang}`);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-bg-primary transition-colors text-text-primary cursor-pointer"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ask for help */}
        <a
          href="https://nayprep.com/support"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary hover:underline transition-colors"
        >
          <HelpCircleIcon className="w-4 h-4 text-text-secondary" />
          <span>Ask for Help</span>
          <ExternalLinkIcon className="w-3 h-3 ml-auto text-text-secondary" />
        </a>

        {/* Logout / Sign In */}
        {!mounted ? (
          <div className="h-10 w-full" />
        ) : isGuest ? (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl text-xs font-black hover:bg-[#ebd060] shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5 transition-all"
          >
            <LogInIcon className="w-4 h-4 text-text-primary" />
            <span>SIGN IN</span>
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-text-secondary hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-200 rounded-xl transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed w-full"
          >
            <LogOutIcon className="w-4 h-4 text-current" />
            <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
