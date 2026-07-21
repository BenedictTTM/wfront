"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Plus,
  Search,
  Trophy,
  ArrowRight,
  Play,
  FileText,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks";
import {
  useDashboard,
  useChallenges,
  useRefillEnergy,
} from "@/features/gamification/hooks";

export default function Dashboard() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: dashboard } = useDashboard();
  const { data: challenges, isLoading: isChallengesLoading } = useChallenges();
  const refillMutation = useRefillEnergy();

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
      onError: (err: any) => {
        toast.error(err.message || "Failed to refill energy");
      },
    });
  };

  const handleStartQuiz = (targetPath: string) => {
    if (dashboard && dashboard.energy.current < 3) {
      toast.warning("⚡ Not enough Energy to start a quiz! (Requires 3 🔋)", {
        action: {
          label: "Refill (+15 🔋)",
          onClick: handleRefillEnergy,
        },
      });
      return;
    }
    router.push(targetPath);
  };

  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-12 w-full max-w-6xl mx-auto">
      {/* ── Top Action Row (Study Mode Switcher) ── */}
      <div className="flex justify-end items-center">
        <div className="relative">
          <button
            onClick={() => setShowStudyModeDropdown(!showStudyModeDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border-2.5 border-border rounded-xl text-sm font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <BookOpen size={16} className="text-[#E28743]" />
            <span>{studyMode}</span>
            <ChevronDown size={14} />
          </button>

          {showStudyModeDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border-2.5 border-border rounded-xl shadow-offset py-1.5 z-30">
              {["Study Mode", "Exam Mode", "Focus Mode", "Casual Mode"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setStudyMode(mode);
                    setShowStudyModeDropdown(false);
                    toast.info(`Active Mode: ${mode}`);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bg-primary transition-colors text-text-primary flex items-center justify-between cursor-pointer"
                >
                  <span>{mode}</span>
                  {studyMode === mode && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mascot & Welcome Banner ── */}
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center animate-capy-bob select-none">
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

        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
            Welcome back, {user?.name || user?.email?.split("@")[0] || "Scholar"}! 🎓
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
            Ready to master your WASSCE subjects? Attempt quizzes, complete daily quests, and climb the leaderboard!
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative flex items-center bg-surface border-2.5 border-border rounded-2xl shadow-offset focus-within:ring-2 focus-within:ring-primary/40 focus-within:-translate-y-0.5 transition-all duration-150">
          <div className="absolute left-4 text-text-secondary pointer-events-none">
            <Plus size={20} className="stroke-[2.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What subject or topic are we studying today?"
            className="w-full bg-transparent border-0 outline-none pl-12 pr-32 py-4 text-sm md:text-base font-extrabold placeholder:font-bold placeholder:text-text-secondary text-text-primary"
          />
          <div className="absolute right-2.5">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-[#ebd060] text-text-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={14} strokeWidth={3} />
              <span>SEARCH</span>
            </button>
          </div>
        </div>
      </form>

      {/* ── DAILY QUESTS & ACTIVE CHALLENGES ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-border/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
              <Trophy size={18} className="text-text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                Active Quests & Challenges
              </h2>
              <p className="text-xs font-bold text-text-secondary">
                Complete goals to earn bonus XP rewards!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {isChallengesLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-surface border-2.5 border-border rounded-2xl animate-pulse" />
              ))
            : (challenges ?? []).map((quest) => (
                <div
                  key={quest.id}
                  className="bg-surface border-2.5 border-border rounded-2xl p-5 shadow-offset flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-bg-primary border border-border rounded-md text-text-secondary w-fit">
                        {quest.type}
                      </span>
                      <h3 className="text-base font-extrabold text-text-primary mt-1">
                        {quest.title}
                      </h3>
                      <p className="text-xs font-bold text-text-secondary leading-snug">
                        {quest.description}
                      </p>
                    </div>
                    <div className="px-2.5 py-1 bg-primary border-2 border-border rounded-xl font-black text-xs text-text-primary shrink-0 shadow-[0_2px_0_#141827] whitespace-nowrap">
                      +{quest.xpAward} XP
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-border/10">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary font-black">
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-bg-primary border-2 border-border rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ── QUICK LAUNCH STUDY ACTIONS ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b-2 border-border/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-secondary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
            <Target size={18} className="text-text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              Quick Study Launch
            </h2>
            <p className="text-xs font-bold text-text-secondary">
              Jump straight into practice questions or mock exams.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action 1: Practice Quiz */}
          <div className="bg-surface border-2.5 border-border rounded-2xl p-6 shadow-offset flex flex-col justify-between gap-5 group hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary border-2.5 border-border flex items-center justify-center text-text-primary text-xl font-black shadow-[0_3px_0_#141827]">
                <Play size={22} fill="currentColor" />
              </div>
              <span className="text-xs font-black px-3 py-1 bg-bg-primary border-2 border-border rounded-xl whitespace-nowrap">
                Cost: 3 🔋
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-text-primary">
                Practice Quizzes
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-1 leading-relaxed">
                Choose a WASSCE subject or subtopic and take practice questions with instant explanations and immediate scoring.
              </p>
            </div>

            <button
              onClick={() => handleStartQuiz("/study")}
              className="w-full py-3 bg-primary hover:bg-[#ebd060] text-text-primary border-2.5 border-border rounded-xl font-black text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>START PRACTICE QUIZ</span>
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Action 2: Mock Exam */}
          <div className="bg-surface border-2.5 border-border rounded-2xl p-6 shadow-offset flex flex-col justify-between gap-5 group hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-secondary border-2.5 border-border flex items-center justify-center text-text-primary text-xl font-black shadow-[0_3px_0_#141827]">
                <FileText size={22} />
              </div>
              <span className="text-xs font-black px-3 py-1 bg-bg-primary border-2 border-border rounded-xl whitespace-nowrap">
                Cost: 3 🔋
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-text-primary">
                Mock Examinations
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-1 leading-relaxed">
                Simulate official full-length WASSCE exams under realistic timer conditions with automatic submission.
              </p>
            </div>

            <button
              onClick={() => handleStartQuiz("/study/mock-exams")}
              className="w-full py-3 bg-secondary hover:bg-[#b2c3bc] text-text-primary border-2.5 border-border rounded-xl font-black text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ENTER MOCK EXAM</span>
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

