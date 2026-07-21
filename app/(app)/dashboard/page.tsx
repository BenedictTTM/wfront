"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  Upload,
  FileText,
  Mic,
  Plus,
  Search,
  Trash2,
  X,
  Play,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { useStats } from "@/components/providers/stats-provider";

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
  const { addXp } = useStats();

  // Dropdowns
  const [studyMode, setStudyMode] = useState("Study Mode");
  const [showStudyModeDropdown, setShowStudyModeDropdown] = useState(false);

  // Interaction Modals
  const [activeModal, setActiveModal] = useState<"upload" | "youtube" | "article" | "record" | null>(null);

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
    const mockName = `Lecture Recording #${studySessions.filter((s) => s.type === "voice").length + 1}`;
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

  return (
    <div className="flex flex-col gap-10">
      {/* Top Row Actions (Study Mode Switcher) */}
      <div className="flex justify-end items-center">
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

      {/* Quick Action Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-sm text-text-secondary tracking-widest uppercase">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveModal("upload")}
            className="p-5 border-2 border-border bg-surface rounded-2xl shadow-offset hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">📤</span>
            <span className="text-xs font-bold text-center">Upload Doc</span>
          </button>
          <button
            onClick={() => setActiveModal("youtube")}
            className="p-5 border-2 border-border bg-surface rounded-2xl shadow-offset hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">📺</span>
            <span className="text-xs font-bold text-center">YouTube Video</span>
          </button>
          <button
            onClick={() => setActiveModal("article")}
            className="p-5 border-2 border-border bg-surface rounded-2xl shadow-offset hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">📰</span>
            <span className="text-xs font-bold text-center">Web Article</span>
          </button>
          <button
            onClick={() => setActiveModal("record")}
            className="p-5 border-2 border-border bg-surface rounded-2xl shadow-offset hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">🎙️</span>
            <span className="text-xs font-bold text-center">Record Voice</span>
          </button>
        </div>
      </div>

      {/* Study Sessions / Activity Feed */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-sm text-text-secondary tracking-widest uppercase">Active Study Feed</h3>
        <div className="flex flex-col gap-3">
          {studySessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-surface border-2 border-border rounded-xl shadow-[0_3px_0_#141827] animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {session.type === "document"
                    ? "📄"
                    : session.type === "youtube"
                    ? "📺"
                    : session.type === "voice"
                    ? "🎙️"
                    : session.type === "article"
                    ? "📰"
                    : "🔍"}
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-text-primary max-w-md md:max-w-xl truncate">{session.title}</h4>
                  <p className="text-[10px] font-bold text-text-secondary">{session.date}</p>
                </div>
              </div>
              <button
                onClick={() => deleteSession(session.id)}
                className="p-1.5 border border-transparent rounded hover:border-border hover:bg-bg-primary text-text-secondary hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────────── */}

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
                    <div className="wave-bar w-1.5 bg-[#FF8A8A] rounded-full h-8" style={{ animationDelay: "0s" }} />
                    <div className="wave-bar w-1.5 bg-primary rounded-full h-6" style={{ animationDelay: "0.2s" }} />
                    <div className="wave-bar w-1.5 bg-secondary rounded-full h-10" style={{ animationDelay: "0.4s" }} />
                    <div className="wave-bar w-1.5 bg-primary rounded-full h-5" style={{ animationDelay: "0.1s" }} />
                    <div className="wave-bar w-1.5 bg-[#FF8A8A] rounded-full h-8" style={{ animationDelay: "0.3s" }} />
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
    </div>
  );
}
