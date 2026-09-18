"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Compass, 
  Medal,
  User, 
  Globe, 
  HelpCircle, 
  ExternalLink, 
  ChevronDown, 
  X,
  LogOut,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser, useLogoutMutation } from "@/features/auth/hooks";

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
  else if (pathname.startsWith("/analytics")) activeTab = "explore";
  else if (pathname.startsWith("/achievements")) activeTab = "achievements";
  else if (pathname.startsWith("/profile")) activeTab = "profile";

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r-3 border-border flex flex-col justify-between py-6 px-4
      transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
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
            className="lg:hidden ml-auto p-1 border-2 border-border rounded-md hover:bg-surface-muted"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "home" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <Home size={18} strokeWidth={activeTab === "home" ? 2.5 : 2} />
            <span>HOME</span>
          </Link>

          <Link
            href="/study"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "study" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <BookOpen size={18} strokeWidth={activeTab === "study" ? 2.5 : 2} />
            <span>STUDY</span>
          </Link>

          <Link
            href="/leaderboards"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "leaderboard" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <Trophy size={18} strokeWidth={activeTab === "leaderboard" ? 2.5 : 2} />
            <span>LEADERBOARD</span>
          </Link>

          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "explore" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <Compass size={18} strokeWidth={activeTab === "explore" ? 2.5 : 2} />
            <span>ANALYTICS</span>
          </Link>

          <Link
            href="/achievements"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "achievements" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <Medal size={18} strokeWidth={activeTab === "achievements" ? 2.5 : 2} />
            <span>ACHIEVEMENTS</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm text-left
              ${activeTab === "profile" 
                ? "bg-[#FFFDF6] text-[#FF9E2C] border-primary shadow-[0_3px_0_#141827]" 
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-secondary"
              }`}
          >
            <User size={18} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
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
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-surface border-2 border-border rounded-xl text-sm font-semibold hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>{language}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showLangDropdown ? "rotate-180" : ""}`} />
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
                  className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-bg-primary transition-colors text-text-primary"
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
          <HelpCircle size={16} />
          <span>Ask for Help</span>
          <ExternalLink size={12} className="ml-auto" />
        </a>

        {/* Logout / Sign In */}
        {!mounted ? (
          <div className="h-10 w-full" />
        ) : isGuest ? (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl text-xs font-black hover:bg-[#ebd060] shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5 transition-all"
          >
            <LogIn size={16} strokeWidth={2.5} />
            <span>SIGN IN</span>
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-text-secondary hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-200 rounded-xl transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed w-full"
          >
            <LogOut size={16} strokeWidth={2} />
            <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
