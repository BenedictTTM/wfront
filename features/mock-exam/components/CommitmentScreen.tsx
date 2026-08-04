"use client";

// features/mock-exam/components/CommitmentScreen.tsx
// Pre-exam focus agreement screen shown before LockIn™ mode begins.

import React, { useState } from "react";
import {
  Shield,
  Clock,
  FileText,
  AlertTriangle,
  ChevronRight,
  X,
} from "lucide-react";
import { MockExamConfig } from "../types";

import { AudioService } from "../services/audio-service";
import { NotificationService } from "../services/notification-service";

interface CommitmentScreenProps {
  config: MockExamConfig;
  onBegin: () => void;
  onCancel: () => void;
  isInitializing: boolean;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} minute${m !== 1 ? "s" : ""}`;
}

const RULES = [
  "Do not switch browser tabs during the examination.",
  "Do not minimize or leave the browser window.",
  "If you lose focus for more than 10 seconds, the simulation ends.",
  "Progress is only saved if you complete and submit the exam.",
  "There is no option to pause or resume this simulation.",
];

export function CommitmentScreen({
  config,
  onBegin,
  onCancel,
  isInitializing,
}: CommitmentScreenProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(
    NotificationService.getInstance().isEnabledPreference(),
  );

  const duration = formatDuration(config.durationSeconds);
  const estimatedMinutes = Math.ceil((config.questionCount * 90) / 60);

  const handleBegin = async () => {
    AudioService.getInstance().unlock();
    if (enableNotifications && NotificationService.getInstance().isSupported()) {
      await NotificationService.getInstance().requestPermission();
    } else {
      NotificationService.getInstance().setEnabledPreference(false);
    }
    onBegin();
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col gap-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-[#141827] rounded-t-2xl px-8 pt-8 pb-6 flex flex-col gap-4 border-2 border-[#141827]">
        {/* LockIn badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F6D86B] flex items-center justify-center">
            <Shield size={16} className="text-[#141827]" strokeWidth={2.5} />
          </div>
          <span className="text-[#F6D86B] font-black text-xs tracking-[0.18em] uppercase">
            LockIn™ Simulation
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {config.title}
          </h1>
          <p className="text-sm text-white/60 font-medium leading-relaxed">
            You are about to enter an immersive WASSCE examination environment.
            This simulation recreates a real examination hall experience.
          </p>
        </div>

        {/* Exam stats grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <Clock size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
            </div>
            <span className="text-white font-black text-sm">{duration}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <FileText size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Questions</span>
            </div>
            <span className="text-white font-black text-sm">{config.questionCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <Clock size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Est. time</span>
            </div>
            <span className="text-white font-black text-sm">~{estimatedMinutes}m</span>
          </div>
        </div>
      </div>

      {/* ── Rules ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-x-2 border-[#141827] px-8 py-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" strokeWidth={2.5} />
          <h2 className="text-sm font-black text-[#141827] uppercase tracking-wider">
            Examination Rules
          </h2>
        </div>

        <ul className="flex flex-col gap-3">
          {RULES.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#141827] text-white flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5">
                {i + 1}
              </div>
              <span className="text-sm text-[#5C6470] font-medium leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>

        {/* Notification Alert Permission preference */}
        {NotificationService.getInstance().isSupported() && (
          <div className="p-3 bg-[#F5F1E8] border border-[#141827]/10 rounded-xl flex items-start gap-3 mt-1">
            <input
              type="checkbox"
              id="lockin-notif-toggle"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#141827] text-[#141827] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="lockin-notif-toggle" className="text-xs font-semibold text-[#141827] leading-relaxed cursor-pointer select-none">
              Send desktop notifications if focus is lost (helps prevent accidental simulation failure).
            </label>
          </div>
        )}

        {/* Commitment checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mt-1">
          <div
            className={`w-5 h-5 rounded border-2 border-[#141827] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              confirmed ? "bg-[#141827]" : "bg-white"
            }`}
            onClick={() => setConfirmed((p) => !p)}
          >
            {confirmed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            className="text-sm font-semibold text-[#5C6470] leading-relaxed select-none"
            onClick={() => setConfirmed((p) => !p)}
          >
            I understand the rules and commit to remaining focused for the full
            duration of this examination.
          </span>
        </label>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="bg-[#F5F1E8] border-2 border-t-0 border-[#141827] rounded-b-2xl px-8 py-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isInitializing}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#141827] rounded-xl font-bold text-xs text-[#141827] hover:bg-[#141827] hover:text-white transition-all disabled:opacity-40 cursor-pointer"
        >
          <X size={14} />
          Cancel
        </button>

        <button
          type="button"
          onClick={handleBegin}
          disabled={!confirmed || isInitializing}
          className="flex items-center gap-2 px-6 py-3 bg-[#141827] text-white border-2 border-[#141827] rounded-xl font-black text-sm shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {isInitializing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <span>Begin Simulation</span>
              <ChevronRight size={16} strokeWidth={3} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
