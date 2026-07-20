"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Library,
  ClipboardList,
  Trophy,
  Compass,
  User,
  Globe,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Upload,
  FileText,
  Mic,
  Zap,
  Flame,
  Gem,
  Bell,
  Lock,
  Star,
  Plus,
  Search,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Play,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/shared/sidebar";

// Custom YouTube Icon to replace missing Lucide export in this version
const Youtube = ({ size = 24, ...props }: React.ComponentProps<"svg"> & { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
);

export default function Dashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stats State
  const [xp, setXp] = useState(20);
  const [gems, setGems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  // Dropdowns
  const [studyMode, setStudyMode] = useState("Study Mode");
  const [showStudyModeDropdown, setShowStudyModeDropdown] = useState(false);



  // Interaction Modals
  const [activeModal, setActiveModal] = useState<"upload" | "youtube" | "article" | "record" | "quiz" | null>(null);

  // Search/Study Topic
  const [searchQuery, setSearchQuery] = useState("");
  const [studySessions, setStudySessions] = useState<{ id: string; title: string; type: string; date: string }[]>([
    { id: "1", title: "WASSCE Elective Maths - Trigonometry", type: "document", date: "Just now" },
    { id: "2", title: "English Language - Essay Writing Structure", type: "youtube", date: "2 hours ago" }
  ]);

  // Modal Inputs
  const [docName, setDocName] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordingSessions, setRecordingSessions] = useState<{ id: string; name: string; duration: number }[]>([]);

  // Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Helper to add XP
  const addXp = (amount: number, reason: string) => {
    setXp((prev) => {
      const nextXp = prev + amount;
      toast.success(`+${amount} XP: ${reason}!`);
      // Unlock check
      if (prev < 30 && nextXp >= 30) {
        toast.info("🏆 Leaderboards unlocked! You can now view and compete with other scholars.");
      }
      return nextXp;
    });
  };

  // Quick action submit handlers
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setStudySessions((prev) => [
      { id: Date.now().toString(), title: docName, type: "document", date: "Just now" },
      ...prev
    ]);
    addXp(15, "Uploaded document");
    setDocName("");
    setActiveModal(null);
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytLink.trim()) return;
    const title = ytLink.includes("youtube.com") || ytLink.includes("youtu.be")
      ? `YouTube Video: ${ytLink.split("v=")[1]?.substring(0, 8) || "Educational Lesson"}`
      : `YouTube Video: ${ytLink}`;
    setStudySessions((prev) => [
      { id: Date.now().toString(), title, type: "youtube", date: "Just now" },
      ...prev
    ]);
    addXp(10, "Added YouTube link");
    setYtLink("");
    setActiveModal(null);
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleLink.trim()) return;
    setStudySessions((prev) => [
      { id: Date.now().toString(), title: `Article: ${articleLink.replace(/(^\w+:|^)\/\//, "").substring(0, 30)}...`, type: "article", date: "Just now" },
      ...prev
    ]);
    addXp(10, "Added article link");
    setArticleLink("");
    setActiveModal(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    toast.info("Voice recorder active. Speak clearly...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    const mockName = `Lecture Recording #${recordingSessions.length + 1}`;
    setStudySessions((prev) => [
      { id: Date.now().toString(), title: `${mockName} (${recordDuration}s)`, type: "voice", date: "Just now" },
      ...prev
    ]);
    addXp(20, "Recorded lecture");
    setActiveModal(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setStudySessions((prev) => [
      { id: Date.now().toString(), title: `Search Topic: ${searchQuery}`, type: "search", date: "Just now" },
      ...prev
    ]);
    addXp(5, "Searched study topic");
    setSearchQuery("");
    toast.info(`Creating study plan for: "${searchQuery}"`);
  };

  const deleteSession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
    toast.info("Session item removed.");
  };

  // Mock quiz questions
  const quizQuestions = [
    {
      question: "Which of the following is the correct formula for the sum of interior angles of an n-sided polygon?",
      options: ["(n - 2) * 180°", "(n - 1) * 180°", "(2n - 4) * 90°", "Both A and C"],
      answer: 3 // Both A and C is correct because (2n-4)*90 = (n-2)*180
    },
    {
      question: "In English grammar, a word that describes a verb, adjective, or other adverb is called a:",
      options: ["Noun", "Adjective", "Pronoun", "Adverb"],
      answer: 3
    },
    {
      question: "What is the primary function of mitochondria in a cell?",
      options: ["Protein synthesis", "Energy production (ATP)", "Waste storage", "Cell division"],
      answer: 1
    }
  ];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const submitQuizAnswer = () => {
    if (selectedAnswer === null) return;
    if (selectedAnswer === quizQuestions[currentQuizQuestion].answer) {
      setQuizScore((prev) => prev + 1);
      toast.success("Correct answer!");
    } else {
      toast.error("Oops! That's incorrect.");
    }

    if (currentQuizQuestion + 1 < quizQuestions.length) {
      setCurrentQuizQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const claimQuizRewards = () => {
    const finalScore = quizScore;
    const gainedXp = finalScore * 15;
    const gainedGems = finalScore > 1 ? 5 : 0;

    addXp(gainedXp, `Completed Quiz (${finalScore}/${quizQuestions.length})`);
    if (gainedGems > 0) {
      setGems((prev) => prev + gainedGems);
      toast.success(`+${gainedGems} Gems awarded for high score!`);
    }
    setCompletedQuizzes((prev) => prev + 1);
    setStreak((prev) => (prev === 0 ? 1 : prev));
    setActiveModal(null);
    resetQuiz();
  };

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-text-primary antialiased relative">

      {/* Dynamic Mascot Styling */}
      <style>{`
        @keyframes capy-bob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.015); }
        }
        @keyframes wave-pulse {
          0%, 100% { height: 4px; }
          50% { height: 28px; }
        }
        .animate-capy-bob {
          animation: capy-bob 3.5s ease-in-out infinite;
        }
        .wave-bar {
          animation: wave-pulse 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────────────── */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── CENTER CONTENT AREA ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-surface border-r-3 border-border flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b-2 border-border bg-bg-secondary sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 border-2 border-border rounded-lg bg-surface"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-lg tracking-tight">Piply</span>
          </div>

          {/* Stats on mobile header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-sm text-[#E28743]" title="XP Pool">
              <Zap size={16} fill="#E28743" />
              <span>{xp}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-red-500" title="Streak">
              <Flame size={16} fill="currentColor" />
              <span>{streak}</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-border overflow-hidden bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
              N
            </div>
          </div>
        </header>

        {/* Main Feed Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:p-10 flex flex-col gap-10">

          {/* Top Row Actions (Study Mode Switcher) */}
          <div className="flex justify-between items-center">
            <div>
              {activeTab !== "home" && (
                <button
                  onClick={() => setActiveTab("home")}
                  className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  &larr; Back to Home
                </button>
              )}
            </div>

            {/* Study Mode Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStudyModeDropdown(!showStudyModeDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-surface border-2 border-border rounded-xl text-sm font-bold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <BookOpen size={16} className="text-[#E28743]" />
                <span>{studyMode}</span>
                <ChevronDown size={14} />
              </button>

              {showStudyModeDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border-2 border-border rounded-xl shadow-offset py-1.5 z-30">
                  {["Study Mode", "Exam Mode", "Focus Mode", "Casual Mode"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setStudyMode(mode);
                        setShowStudyModeDropdown(false);
                        toast.info(`Active Mode: ${mode}`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-bg-primary transition-colors text-text-primary flex items-center justify-between"
                    >
                      <span>{mode}</span>
                      {studyMode === mode && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9E2C]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC SCREEN SWITCHER */}
          {activeTab === "home" ? (
            <>
              {/* Welcoming Mascot Banner */}
              <div className="flex flex-col items-center text-center gap-4 py-4">
                {/* Big Animated Mascot */}
                <div className="w-36 h-36 flex items-center justify-center animate-capy-bob select-none">
                  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
                    {/* Ears */}
                    <ellipse cx="55" cy="55" rx="7" ry="10" fill="#b06e33" stroke="#141827" strokeWidth="3" transform="rotate(-15 55 55)" />
                    <ellipse cx="55" cy="55" rx="3.5" ry="6" fill="#eed2bc" />

                    <ellipse cx="105" cy="55" rx="7" ry="10" fill="#b06e33" stroke="#141827" strokeWidth="3" transform="rotate(15 105 55)" />
                    <ellipse cx="105" cy="55" rx="3.5" ry="6" fill="#eed2bc" />

                    {/* Chubby Body */}
                    <ellipse cx="80" cy="115" rx="42" ry="34" fill="#c37d43" stroke="#141827" strokeWidth="3" />
                    <ellipse cx="80" cy="118" rx="26" ry="20" fill="#d99b65" />

                    {/* Head */}
                    <rect x="52" y="52" width="56" height="52" rx="18" fill="#d68d50" stroke="#141827" strokeWidth="3" />

                    {/* Big Capy Snout */}
                    <rect x="62" y="74" width="36" height="26" rx="9" fill="#c37d43" stroke="#141827" strokeWidth="3" />
                    <ellipse cx="80" cy="81" rx="4.5" ry="3" fill="#141827" />

                    {/* Cute Eyes */}
                    <ellipse cx="66" cy="67" rx="3" ry="3.5" fill="#141827" />
                    <circle cx="65" cy="65.5" r="1" fill="#ffffff" />
                    <ellipse cx="94" cy="67" rx="3" ry="3.5" fill="#141827" />
                    <circle cx="93" cy="65.5" r="1" fill="#ffffff" />

                    {/* Soft Rosy Cheeks */}
                    <ellipse cx="59" cy="76" rx="5.5" ry="2.5" fill="#ffb3c1" opacity="0.8" />
                    <ellipse cx="101" cy="76" rx="5.5" ry="2.5" fill="#ffb3c1" opacity="0.8" />

                    {/* Professor Mini-Hat */}
                    <ellipse cx="80" cy="49" rx="20" ry="4" fill="#a06030" stroke="#141827" strokeWidth="3" />
                    <path d="M 66 49 L 68 36 C 68 34, 92 34, 92 36 L 94 49 Z" fill="#a06030" stroke="#141827" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M 68 46 C 76 45, 84 45, 92 46" fill="none" stroke="#F6D86B" strokeWidth="2.5" />

                    {/* Open Textbook */}
                    <g transform="translate(44, 108)">
                      {/* Pages background */}
                      <path d="M 4 22 C 16 19, 36 24, 36 24 C 36 24, 56 19, 68 22 C 68 22, 68 3, 68 3 C 56 1, 36 6, 36 6 C 36 6, 16 1, 4 3 Z" fill="#ffffff" stroke="#141827" strokeWidth="3" strokeLinejoin="round" />
                      <line x1="36" y1="6" x2="36" y2="24" stroke="#141827" strokeWidth="2.5" />

                      {/* Hard cover hints */}
                      <path d="M 2 23 L 2 5 L 4 3" fill="none" stroke="#141827" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 70 23 L 70 5 L 68 3" fill="none" stroke="#141827" strokeWidth="3" strokeLinecap="round" />

                      {/* Text writing lines */}
                      <line x1="10" y1="9" x2="28" y2="9" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="10" y1="13" x2="24" y2="13" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="10" y1="17" x2="30" y2="17" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />

                      <line x1="44" y1="9" x2="62" y2="9" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="44" y1="13" x2="58" y2="13" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="44" y1="17" x2="60" y2="17" stroke="#5c6470" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Cute paws holding book edges */}
                    <ellipse cx="46" cy="116" rx="6" ry="5.5" fill="#d68d50" stroke="#141827" strokeWidth="2.5" />
                    <ellipse cx="114" cy="116" rx="6" ry="5.5" fill="#d68d50" stroke="#141827" strokeWidth="2.5" />
                  </svg>
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
                    Hi, niiafotey. Let&apos;s learn.
                  </h1>
                  <p className="text-sm md:text-base text-text-secondary max-w-md mx-auto">
                    Prepare for WASSCE exams by uploading your course materials or testing your knowledge!
                  </p>
                </div>
              </div>

              {/* Study Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mx-auto">
                <div className="relative flex items-center bg-surface border-2.5 border-border rounded-xl shadow-offset focus-within:ring-2 focus-within:ring-primary/40 focus-within:-translate-y-0.5 transition-all duration-150">
                  <div className="absolute left-4 text-text-secondary pointer-events-none">
                    <Plus size={20} className="stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are we studying today?"
                    className="w-full bg-transparent border-0 outline-none pl-12 pr-28 py-4 text-sm md:text-base font-bold placeholder-text-secondary text-text-primary"
                  />
                  <div className="absolute right-2.5">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary hover:bg-[#ebd060] text-text-primary border-2 border-border rounded-lg text-xs font-bold shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] transition-all flex items-center gap-1.5"
                    >
                      <Search size={12} strokeWidth={3} />
                      <span>SEARCH</span>
                    </button>
                  </div>
                </div>
              </form>




            </>
          ) : activeTab === "study" ? (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Study Center</h2>
              <div className="p-6 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col gap-4">
                <span className="text-4xl">📚</span>
                <h3 className="text-lg font-bold">Launch your next Mock Exam</h3>
                <p className="text-sm text-text-secondary">
                  Complete official WASSCE style exam papers dynamically generated from your notes and past curriculum documents.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal("quiz")}
                    className="px-5 py-2.5 bg-primary border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all"
                  >
                    TAKE PRACTICE QUIZ
                  </button>
                  <button
                    onClick={() => addXp(25, "Finished lesson")}
                    className="px-5 py-2.5 bg-white border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all"
                  >
                    SIMULATE EXAM PREP
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "library" ? (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Your Library</h2>
              <p className="text-sm text-text-secondary">Review all assets, textbooks, and past papers uploaded to your workspace.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Maths Textbook.pdf", "English Essay Structure.docx", "Science Notes - Cells.pdf"].map((file, i) => (
                  <div key={i} className="p-4 bg-surface border-2 border-border rounded-xl shadow-[0_3px_0_#141827] flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📁</span>
                      <span className="text-xs font-bold truncate">{file}</span>
                    </div>
                    <button
                      onClick={() => addXp(5, "Reviewed library book")}
                      className="w-full text-center py-1 text-xs font-bold border-2 border-border rounded-md hover:bg-bg-secondary"
                    >
                      READ DOCUMENT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "assignments" ? (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Assignments</h2>
              <div className="p-6 border-2 border-border bg-surface rounded-xl shadow-offset flex flex-col gap-2">
                <h3 className="font-extrabold text-md">Upcoming Course Tasks</h3>
                <p className="text-sm text-text-secondary">No pending teacher assignments found for your current tracks. You are all set!</p>
                <div className="mt-4">
                  <button
                    onClick={() => addXp(10, "Volunteered for task")}
                    className="px-4 py-2 bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2.5px_0_#141827]"
                  >
                    Simulate Assignment Check (+10 XP)
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "leaderboard" ? (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Leaderboard Rankings</h2>
              {xp < 30 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-bg-secondary flex flex-col items-center gap-4">
                  <Lock size={32} className="text-text-secondary" />
                  <h3 className="font-extrabold">Leaderboard Locked</h3>
                  <p className="text-sm text-text-secondary max-w-xs">
                    You need to reach at least 30 XP to unlock rankings. Currently you have {xp} XP. (Tip: complete active cards in feed to gain XP)
                  </p>
                </div>
              ) : (
                <div className="border-2 border-border bg-surface rounded-xl shadow-offset overflow-hidden">
                  <div className="bg-[#FFFDF6] border-b-2 border-border p-4">
                    <span className="text-sm font-extrabold text-[#FF9E2C]">WEEKLY RANKINGS</span>
                  </div>
                  <div className="divide-y-2 divide-border">
                    {[
                      { rank: 1, name: "Amina Mensah", xp: 120, active: false },
                      { rank: 2, name: "niiafotey (You)", xp: xp, active: true },
                      { rank: 3, name: "Kofi Owusu", xp: 28, active: false },
                      { rank: 4, name: "Sena Tamakloe", xp: 15, active: false }
                    ]
                      .sort((a, b) => b.xp - a.xp)
                      .map((student, idx) => (
                        <div
                          key={student.name}
                          className={`flex items-center justify-between p-4 ${student.active ? "bg-primary/20 font-bold" : "font-medium"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-xs font-extrabold">{idx + 1}</span>
                            <span className="text-sm">{student.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-[#E28743]">{student.xp} XP</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "explore" ? (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Explore Tracks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Core Maths", "Integrated Science", "Social Studies", "General English"].map((track) => (
                  <div key={track} className="p-4 border-2 border-border bg-surface rounded-xl shadow-[0_4px_0_#141827] flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm">{track}</h4>
                      <p className="text-xs text-text-secondary">WASSCE Complete Syllabus</p>
                    </div>
                    <button
                      onClick={() => addXp(12, `Subscribed to ${track}`)}
                      className="px-3 py-1.5 bg-[#FFFDF6] hover:bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2px_0_#141827] transition-all"
                    >
                      ENROLL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              <h2 className="text-2xl font-extrabold">Student Profile</h2>
              <div className="border-2 border-border bg-surface rounded-xl p-6 shadow-offset flex items-center gap-6">
                <div className="w-16 h-16 rounded-full border-3 border-border bg-emerald-500 flex items-center justify-center font-extrabold text-white text-3xl">
                  N
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-extrabold">niiafotey</h3>
                  <span className="text-xs font-bold text-text-secondary">WASSCE Student Candidate</span>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold bg-[#FBF9F3] border border-border px-2 py-0.5 rounded-full text-[#E28743]">
                      XP: {xp}
                    </span>
                    <span className="text-xs font-bold bg-[#FBF9F3] border border-border px-2 py-0.5 rounded-full text-blue-500">
                      Gems: {gems}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── RIGHT SIDEBAR (STATS & QUESTS) ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-80 bg-bg-primary h-screen flex-col p-6 sticky top-0 overflow-y-auto gap-6 shrink-0 border-l border-border/20">

        {/* Top Header stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 bg-surface px-4 py-2 border-2 border-border rounded-xl">
            {/* Battery / Energy */}
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#FF9E2C]" title="Energy">
              <span className="text-lg">🔋</span>
              <span>20</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-red-500" title="Streak count">
              <Flame size={16} fill="currentColor" />
              <span>{streak}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-blue-500" title="Gems">
              <Gem size={15} fill="currentColor" />
              <span>{gems}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info("No new notifications")}
              className="p-2 border-2 border-border bg-surface rounded-xl text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Bell size={16} />
            </button>
            <div
              onClick={() => setActiveTab("profile")}
              className="w-10 h-10 rounded-full border-2 border-border overflow-hidden bg-emerald-500 cursor-pointer flex items-center justify-center font-extrabold text-white text-sm"
              title="Profile"
            >
              N
            </div>
          </div>
        </div>

        {/* Try Premium Promo Card */}
        <div className="bg-surface border-2 border-border rounded-2xl p-5 shadow-offset flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-[#FF9E2C] text-sm tracking-wide uppercase">Try Premium for free</h3>
              <p className="text-xs font-bold text-text-secondary">
                Get up to 2 weeks free. Cancel anytime.
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-blue-50 border-2 border-border rounded-lg flex items-center justify-center">
              <Gem size={20} className="text-blue-500" fill="#3b82f6" />
            </div>
          </div>

          <button
            onClick={() => {
              setGems((prev) => prev + 100);
              toast.success("💎 Premium active! +100 bonus Gems granted.");
            }}
            className="w-full text-center py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-extrabold text-xs tracking-wider shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all"
          >
            START FREE TRIAL
          </button>
        </div>

        {/* Unlock Leaderboards Status Card */}
        <div className="bg-surface border-2 border-border rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-extrabold text-xs text-text-secondary tracking-widest uppercase">Unlock Leaderboards</h3>

          <div className="flex flex-col items-center gap-3 py-2 text-center">
            {xp >= 30 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-[#FFFDF6] border-2 border-border flex items-center justify-center text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-extrabold text-text-primary">Rankings Unlocked!</span>
                  <span className="text-xs text-text-secondary">View standings under the Leaderboard tab.</span>
                </div>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="px-4 py-1.5 border-2 border-border rounded-lg text-xs font-bold hover:bg-bg-secondary transition-colors"
                >
                  VIEW LEADERBOARD
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border-muted flex items-center justify-center text-text-secondary bg-bg-secondary">
                  <Lock size={20} />
                </div>
                <p className="text-xs text-text-secondary px-2">
                  Earn <span className="font-bold text-text-primary">{30 - xp} more XP</span> to start competing
                </p>
              </>
            )}
          </div>
        </div>

        {/* Daily Quests Card */}
        <div className="bg-surface border-2 border-border rounded-2xl p-5 shadow-offset flex flex-col gap-4">
          <h3 className="font-extrabold text-xs text-text-secondary tracking-widest uppercase">Daily Quests</h3>

          <div className="flex flex-col gap-4">
            {/* Quest 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-yellow-500">
                  <Star size={16} fill={xp >= 50 ? "currentColor" : "none"} />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                    <span>Earn 50 XP</span>
                    <span className="text-[#FF9E2C] font-extrabold">50 gems</span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-bold">
                    {Math.min(xp, 50)} / 50 XP
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 border-r-2 border-border"
                  style={{ width: `${Math.min((xp / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Quest 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-yellow-500">
                  <Star size={16} fill={completedQuizzes >= 3 ? "currentColor" : "none"} />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                    <span>Complete 3 Quizzes</span>
                    <span className="text-[#FF9E2C] font-extrabold">50 gems</span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-bold">
                    {Math.min(completedQuizzes, 3)} / 3 Quizzes
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-3 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300 border-r-2 border-border"
                  style={{ width: `${Math.min((completedQuizzes / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Quiz shortcut */}
          <button
            onClick={() => setActiveModal("quiz")}
            className="w-full py-1.5 border-2 border-border text-center text-xs font-extrabold rounded-lg hover:bg-bg-secondary"
          >
            PLAY PRACTICE QUIZ
          </button>
        </div>

      </aside>

      {/* ─── MODALS & DIALOG OVERLAYS ───────────────────────────────────────────── */}

      {/* 1. Upload Documents Modal */}
      {activeModal === "upload" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <Upload size={18} />
                <span>Upload Study Document</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 border border-border rounded hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary">DOCUMENT TITLE</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Maths Trigonometry revision notes"
                  className="border-2 border-border rounded-lg p-2.5 text-sm font-bold bg-white text-text-primary focus:outline-none"
                  required
                />
              </div>

              {/* Drag and Drop Zone Mock */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-[#FBF9F3] hover:bg-primary/10 transition-colors cursor-pointer flex flex-col items-center gap-2">
                <span className="text-3xl">📤</span>
                <span className="text-xs font-bold text-text-primary">Click to select PDF or image</span>
                <span className="text-[10px] text-text-secondary font-bold">PDF, TXT, DOCX, PNG (Max 10MB)</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border-2 border-border rounded-lg text-xs font-bold hover:bg-surface-muted"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2px_0_#141827]"
                >
                  SUBMIT (+15 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. YouTube Link Modal */}
      {activeModal === "youtube" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <Youtube size={18} className="text-red-500" />
                <span>Add YouTube Link</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 border border-border rounded hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleYoutubeSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary">YOUTUBE URL</label>
                <input
                  type="url"
                  value={ytLink}
                  onChange={(e) => setYtLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="border-2 border-border rounded-lg p-2.5 text-sm font-bold bg-white text-text-primary focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-[#FFFDF6] border border-border rounded-lg text-xs text-text-secondary flex gap-2">
                <span className="text-sm">💡</span>
                <span>Piply will automatically transcribe video contents and generate flashcards for you.</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border-2 border-border rounded-lg text-xs font-bold hover:bg-surface-muted"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2px_0_#141827]"
                >
                  ADD VIDEO (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Article Link Modal */}
      {activeModal === "article" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <FileText size={18} className="text-[#C8D4CF]" />
                <span>Add Article Link</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 border border-border rounded hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleArticleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary">ARTICLE LINK URL</label>
                <input
                  type="url"
                  value={articleLink}
                  onChange={(e) => setArticleLink(e.target.value)}
                  placeholder="https://wikipedia.org/wiki/..."
                  className="border-2 border-border rounded-lg p-2.5 text-sm font-bold bg-white text-text-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border-2 border-border rounded-lg text-xs font-bold hover:bg-surface-muted"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary border-2 border-border rounded-lg text-xs font-extrabold shadow-[0_2px_0_#141827]"
                >
                  IMPORT ARTICLE (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Record Lecture Modal */}
      {activeModal === "record" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <Mic size={18} />
                <span>Voice Lecture Recorder</span>
              </h3>
              <button
                onClick={() => {
                  setIsRecording(false);
                  setActiveModal(null);
                }}
                className="p-1 border border-border rounded hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {isRecording ? (
                <>
                  <div className="flex items-center gap-1.5 h-10 px-4">
                    {/* Simulated Waveform Bar blocks */}
                    <div className="wave-bar w-1.5 bg-[#FF8A8A] rounded-full" style={{ animationDelay: "0s" }} />
                    <div className="wave-bar w-1.5 bg-primary rounded-full" style={{ animationDelay: "0.2s" }} />
                    <div className="wave-bar w-1.5 bg-secondary rounded-full" style={{ animationDelay: "0.4s" }} />
                    <div className="wave-bar w-1.5 bg-primary rounded-full" style={{ animationDelay: "0.1s" }} />
                    <div className="wave-bar w-1.5 bg-[#FF8A8A] rounded-full" style={{ animationDelay: "0.3s" }} />
                  </div>
                  <span className="text-sm font-bold text-red-500 animate-pulse">RECORDING LIVE</span>
                  <span className="text-2xl font-extrabold font-mono">00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>

                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white border-2 border-border rounded-xl font-bold text-xs shadow-[0_2.5px_0_#141827] transition-all"
                  >
                    <Square size={12} fill="white" />
                    <span>STOP RECORDING</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border-2 border-border bg-[#FBF9F3] flex items-center justify-center text-text-secondary">
                    <Mic size={28} />
                  </div>
                  <span className="text-sm font-bold text-text-secondary">Press Start to record live discussions or study sessions</span>

                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-bold text-xs shadow-[0_2.5px_0_#141827] transition-all"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>START RECORDING</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border-muted">
              <button
                type="button"
                onClick={() => {
                  setIsRecording(false);
                  setActiveModal(null);
                }}
                className="px-4 py-2 border-2 border-border rounded-lg text-xs font-bold hover:bg-surface-muted"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Practice Quiz Modal */}
      {activeModal === "quiz" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-xl bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <Star size={18} fill="#F6D86B" className="text-yellow-500" />
                <span>WASSCE Practice Quiz</span>
              </h3>
              <button
                onClick={() => {
                  resetQuiz();
                  setActiveModal(null);
                }}
                className="p-1 border border-border rounded hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>

            {!quizFinished ? (
              <div className="flex flex-col gap-4">
                {/* Question progress */}
                <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                  <span>QUESTION {currentQuizQuestion + 1} OF {quizQuestions.length}</span>
                  <span>SCORE: {quizScore}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentQuizQuestion) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question body */}
                <div className="p-4 bg-bg-primary border-2 border-border rounded-xl">
                  <h4 className="font-extrabold text-sm md:text-base text-text-primary leading-relaxed">
                    {quizQuestions[currentQuizQuestion].question}
                  </h4>
                </div>

                {/* Options list */}
                <div className="flex flex-col gap-2.5">
                  {quizQuestions[currentQuizQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full text-left p-3.5 border-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between
                        ${selectedAnswer === idx
                          ? "bg-[#FFFDF6] border-[#FF9E2C] text-[#FF9E2C] shadow-[0_2px_0_#FF9E2C]"
                          : "bg-surface border-border hover:bg-bg-secondary"
                        }`}
                    >
                      <span>{option}</span>
                      <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[10px]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border-muted">
                  <button
                    type="button"
                    onClick={submitQuizAnswer}
                    disabled={selectedAnswer === null}
                    className="px-5 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-bold text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {currentQuizQuestion + 1 === quizQuestions.length ? "FINISH QUIZ" : "NEXT QUESTION"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <span className="text-5xl">🎉</span>
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xl font-extrabold text-text-primary">Quiz Complete!</h4>
                  <p className="text-xs font-bold text-text-secondary">
                    You scored <span className="text-text-primary font-extrabold">{quizScore} / {quizQuestions.length}</span> correct answers
                  </p>
                </div>

                <div className="bg-[#FFFDF6] border-2 border-border p-4 rounded-xl max-w-sm flex flex-col gap-1 w-full text-xs font-bold">
                  <div className="flex justify-between">
                    <span>XP Granted:</span>
                    <span className="text-[#FF9E2C]">+{quizScore * 15} XP</span>
                  </div>
                  {quizScore > 1 && (
                    <div className="flex justify-between">
                      <span>Gem Rewards:</span>
                      <span className="text-blue-500">+5 Gems</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 border-2 border-border rounded-xl text-xs font-bold hover:bg-surface-muted"
                  >
                    RETRY QUIZ
                  </button>
                  <button
                    onClick={claimQuizRewards}
                    className="px-5 py-2 bg-primary border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_2.5px_0_#141827]"
                  >
                    CLAIM REWARDS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
