"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  Search,
  ArrowRight,
  Play,
  Target,
  LogIn,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentUser, useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import {
  useDashboard,
  useRefillEnergy,
} from "@/features/gamification/hooks";

const GUEST_MAX_ENERGY = 10;

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const user = useCurrentUser();
  const { data: meData } = useMe();
  const isGuest = Boolean(meData && isGuestIdentity(meData));
  const { data: dashboard } = useDashboard();
  const currentEnergy = dashboard?.energy?.current ?? 30;
  const refillMutation = useRefillEnergy();

  useEffect(() => {
    setMounted(true);
  }, []);

  // For guests, cap energy at GUEST_MAX_ENERGY
  const guestEnergy = Math.min(currentEnergy, GUEST_MAX_ENERGY);

  // Mode Dropdown
  const [studyMode, setStudyMode] = useState("Study Mode");
  const [showStudyModeDropdown, setShowStudyModeDropdown] = useState(false);

  // Search Input
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info(`Searching study topics for: "${searchQuery}"`);
    router.push(`/study?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleRefillEnergy = () => {
    if (!dashboard) return;
    if (dashboard.energy.current >= dashboard.energy.max) {
      toast.info("Your Energy capacity is already full (30/30)!");
      return;
    }
    if (dashboard.wallet.gems < 5) {
      toast.error("Insufficient Diamonds! You need at least 5 💎 to refill Energy.");
      return;
    }

    refillMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`⚡ Refilled +15 Energy! (Current: ${data.current}/${data.max})`);
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to refill energy");
      },
    });
  };

  const handleStartQuiz = (targetPath: string) => {
    const availableEnergy = isGuest ? guestEnergy : currentEnergy;
    if (availableEnergy < 3) {
      if (isGuest) {
        toast.warning("⚡ You've used up your guest energy! Sign in to get full access.", {
          action: {
            label: "Sign In",
            onClick: () => router.push("/login"),
          },
        });
      } else {
        toast.warning("⚡ Not enough Energy to start a quiz! (Requires 3 🔋)", {
          action: {
            label: "Refill (+15 🔋)",
            onClick: handleRefillEnergy,
          },
        });
      }
      return;
    }
    router.push(targetPath);
  };

  const QUICK_SUBJECTS = [
    { name: "Core Mathematics", slug: "core-mathematics", icon: "📐" },
    { name: "English Language", slug: "english-language", icon: "📖" },
    { name: "Integrated Science", slug: "integrated-science", icon: "🔬" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍" },
    { name: "Economics", slug: "economics", icon: "📊" },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-16 w-full max-w-5xl mx-auto">
      {/* ── Top Action Row (Study Mode Switcher) ── */}
      <div className="flex flex-wrap justify-between items-center gap-2.5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/20 border-2 border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary shadow-[0_1.5px_0_#141827]">
            WASSCE Scholar Portal
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowStudyModeDropdown(!showStudyModeDropdown)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-surface border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer text-text-primary"
          >
            <BookOpen size={15} className="text-text-primary" />
            <span>{studyMode}</span>
            <ChevronDown size={14} className="stroke-[2.5]" />
          </button>

          {showStudyModeDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border-[2.5px] border-border rounded-xl shadow-[0_6px_0_rgba(20,24,39,0.9)] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              {["Study Mode", "Exam Prep Mode", "Flashcard Drill"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setStudyMode(mode);
                    setShowStudyModeDropdown(false);
                    toast.info(`Active Mode: ${mode}`);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-black hover:bg-bg-primary transition-colors text-text-primary flex items-center justify-between cursor-pointer"
                >
                  <span>{mode}</span>
                  {studyMode === mode && <span className="w-2.5 h-2.5 rounded-full bg-primary border border-border" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Guest Mode Banner ── */}
      {mounted && isGuest && (
        <div className="w-full bg-surface border-[3px] border-border rounded-2xl p-4 sm:p-5 shadow-[0_4px_0_rgba(20,24,39,0.9)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0 mt-0.5 sm:mt-0">
              <Zap size={20} className="text-text-primary fill-text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-black text-text-primary">
                Exploring in Guest Scholar Mode
              </p>
              <p className="text-xs font-extrabold text-text-secondary leading-relaxed">
                You have <span className="text-text-primary font-black">{guestEnergy} / {GUEST_MAX_ENERGY} ⚡</span> guest energy. Sign in to unlock unlimited sessions, save progress &amp; compete on leaderboards.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#ebd060] text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap text-center"
          >
            <LogIn size={15} strokeWidth={2.5} />
            <span>SIGN IN TO SAVE</span>
          </button>
        </div>
      )}

      {/* ── Mascot & Hero Welcome Banner ── */}
      <div className="relative bg-surface border-[3px] border-border rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_6px_0_rgba(20,24,39,0.9)] overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 max-w-xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-primary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-wider text-text-primary shadow-[0_1.5px_0_#141827]">
                🎓 WASSCE Prep
              </span>
              <span className="px-2.5 py-0.5 bg-secondary border-[2px] border-border rounded-full text-[10px] font-black uppercase tracking-wider text-text-primary shadow-[0_1.5px_0_#141827]">
                ⚡ {mounted && isGuest ? guestEnergy : currentEnergy} Energy Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-text-primary leading-tight">
              {mounted && user
                ? `Welcome back, ${user.name || user.email?.split("@")[0] || "Scholar"}! 🎓`
                : mounted && isGuest
                ? "Welcome, Guest Scholar! 👋"
                : "Welcome, Scholar! 👋"}
            </h1>

            <p className="text-xs sm:text-sm font-bold text-text-secondary leading-relaxed">
              {mounted && isGuest
                ? "Prepare for your West African examinations with authoritative quizzes, syllabus tracking, and instant explanations."
                : "Master your curriculum today. Attempt practice challenges, collect mastery stars, and climb the leaderboard rankings!"}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push("/study")}
                className="px-5 py-2.5 bg-primary hover:bg-[#ebd060] text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>OPEN STUDY CENTER</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => handleStartQuiz("/study")}
                className="px-4 py-2.5 bg-surface hover:bg-bg-primary text-text-primary border-[2.5px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer text-center"
              >
                QUICK QUIZ (3 🔋)
              </button>
            </div>
          </div>

          {/* Animated Capybara Mascot */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 flex items-center justify-center animate-capy-bob select-none p-2 bg-bg-primary border-[3px] border-border rounded-3xl shadow-[0_4px_0_rgba(20,24,39,0.9)]">
            <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
              <ellipse cx="55" cy="55" rx="7" ry="10" fill="#b06e33" stroke="#141827" strokeWidth="3" transform="rotate(-15 55 55)" />
              <ellipse cx="55" cy="55" rx="3.5" ry="6" fill="#eed2bc" />
              <ellipse cx="105" cy="55" rx="7" ry="10" fill="#b06e33" stroke="#141827" strokeWidth="3" transform="rotate(15 105 55)" />
              <ellipse cx="105" cy="55" rx="3.5" ry="6" fill="#eed2bc" />

              <ellipse cx="80" cy="115" rx="42" ry="34" fill="#c37d43" stroke="#141827" strokeWidth="3" />
              <ellipse cx="80" cy="118" rx="26" ry="20" fill="#d99b65" />

              <rect x="52" y="52" width="56" height="52" rx="18" fill="#d68d50" stroke="#141827" strokeWidth="3" />
              <rect x="62" y="74" width="36" height="26" rx="9" fill="#c37d43" stroke="#141827" strokeWidth="3" />
              <ellipse cx="80" cy="81" rx="4.5" ry="3" fill="#141827" />

              <ellipse cx="66" cy="67" rx="3" ry="3.5" fill="#141827" />
              <circle cx="65" cy="65.5" r="1" fill="#ffffff" />
              <ellipse cx="94" cy="67" rx="3" ry="3.5" fill="#141827" />
              <circle cx="93" cy="65.5" r="1" fill="#ffffff" />

              <ellipse cx="59" cy="76" rx="5.5" ry="2.5" fill="#ffb3c1" opacity="0.8" />
              <ellipse cx="101" cy="76" rx="5.5" ry="2.5" fill="#ffb3c1" opacity="0.8" />

              <ellipse cx="80" cy="49" rx="20" ry="4" fill="#a06030" stroke="#141827" strokeWidth="3" />
              <path d="M 66 49 L 68 36 C 68 34, 92 34, 92 36 L 94 49 Z" fill="#a06030" stroke="#141827" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 68 46 C 76 45, 84 45, 92 46" fill="none" stroke="#F6D86B" strokeWidth="2.5" />

              <g transform="translate(44, 108)">
                <path d="M 4 22 C 16 19, 36 24, 36 24 C 36 24, 56 19, 68 22 C 68 22, 68 3, 68 3 C 56 1, 36 6, 36 6 C 36 6, 16 1, 4 3 Z" fill="#ffffff" stroke="#141827" strokeWidth="3" strokeLinejoin="round" />
                <line x1="36" y1="6" x2="36" y2="24" stroke="#141827" strokeWidth="2.5" />
                <path d="M 2 23 L 2 5 L 4 3" fill="none" stroke="#141827" strokeWidth="3" strokeLinecap="round" />
                <path d="M 70 23 L 70 5 L 68 3" fill="none" stroke="#141827" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="9" x2="28" y2="9" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="13" x2="24" y2="13" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="17" x2="30" y2="17" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="44" y1="9" x2="62" y2="9" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="44" y1="13" x2="58" y2="13" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="44" y1="17" x2="60" y2="17" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <ellipse cx="46" cy="116" rx="6" ry="5.5" fill="#d68d50" stroke="#141827" strokeWidth="2.5" />
              <ellipse cx="114" cy="116" rx="6" ry="5.5" fill="#d68d50" stroke="#141827" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Search Bar & Quick Subject Jump Pills ── */}
      <div className="flex flex-col gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative flex items-center bg-surface border-[3px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] focus-within:ring-2 focus-within:ring-primary/60 focus-within:-translate-y-0.5 transition-all duration-150">
            <div className="absolute left-4 text-text-secondary pointer-events-none">
              <Search size={18} className="stroke-[2.5]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syllabus topics, formulas, or concepts (e.g., Quadratic Equations)…"
              className="w-full bg-transparent border-0 outline-none pl-12 pr-28 py-3.5 text-xs sm:text-sm font-black placeholder:font-bold placeholder:text-text-secondary text-text-primary"
            />
            <div className="absolute right-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-[#ebd060] text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>SEARCH</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Subject Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary shrink-0">
            Quick Jump:
          </span>
          {QUICK_SUBJECTS.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => router.push(`/study/${s.slug}`)}
              className="px-3 py-1 bg-surface hover:bg-bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── QUICK LAUNCH STUDY ACTIONS ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b-[2.5px] border-border pb-3">
          <div className="w-9 h-9 rounded-xl bg-secondary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
            <Target size={18} className="text-text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">
              Study Launchpad
            </h2>
            <p className="text-xs font-bold text-text-secondary">
              Jump straight into active challenge questions or explore structured journeys.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Action 1: Practice Quiz */}
          <div className="bg-surface border-[3px] border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 group shadow-[0_6px_0_rgba(20,24,39,0.9)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary border-[2.5px] border-border flex items-center justify-center text-text-primary text-xl font-black shadow-[0_3px_0_#141827] shrink-0">
                <Play size={22} fill="currentColor" />
              </div>
              <span className="text-xs font-black px-3 py-1 bg-primary/20 border-[2px] border-border rounded-xl whitespace-nowrap text-text-primary shadow-[0_1.5px_0_#141827]">
                Cost: 3 🔋
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-text-primary">
                Practice Challenges
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-1.5 leading-relaxed">
                Take curriculum-aligned WASSCE questions with instant pedagogical explanations, answer key breakdown, and live scoring.
              </p>
            </div>

            <button
              onClick={() => handleStartQuiz("/study")}
              className="w-full py-3 bg-primary hover:bg-[#ebd060] text-text-primary border-[2.5px] border-border rounded-xl font-black text-xs md:text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider text-center"
            >
              <span>START PRACTICE CHALLENGE</span>
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Action 2: Learning Paths */}
          <div className="bg-surface border-[3px] border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 group shadow-[0_6px_0_rgba(20,24,39,0.9)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-secondary border-[2.5px] border-border flex items-center justify-center text-text-primary text-xl font-black shadow-[0_3px_0_#141827] shrink-0">
                <BookOpen size={22} />
              </div>
              <span className="text-xs font-black px-3 py-1 bg-secondary/30 border-[2px] border-border rounded-xl whitespace-nowrap text-text-primary shadow-[0_1.5px_0_#141827]">
                Free Access
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-text-primary">
                Syllabus Learning Paths
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-1.5 leading-relaxed">
                Explore structured WASSCE curriculum maps stage-by-stage, unlock levels, and track topic mastery stars.
              </p>
            </div>

            <button
              onClick={() => router.push("/study")}
              className="w-full py-3 bg-secondary hover:bg-[#b2c3bc] text-text-primary border-[2.5px] border-border rounded-xl font-black text-xs md:text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider text-center"
            >
              <span>BROWSE CURRICULUM JOURNEYS</span>
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
