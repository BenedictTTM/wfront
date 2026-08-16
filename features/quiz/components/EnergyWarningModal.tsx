"use client";

import React from "react";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EnergyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEnergy?: number;
}

export function EnergyWarningModal({
  isOpen,
  onClose,
  currentEnergy = 0,
}: EnergyWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-text-primary/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-surface border-[3px] border-border rounded-2xl shadow-[0_8px_0_rgba(20,24,39,0.9)] p-6 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border-[2px] border-border flex items-center justify-center shadow-[0_3px_0_rgba(20,24,39,0.9)]">
          <Zap size={32} className="fill-primary text-primary" />
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-black text-text-primary">Need More Energy!</h4>
          <p className="text-xs font-bold text-text-secondary leading-relaxed">
            Starting a practice quiz requires{" "}
            <span className="text-text-primary font-black">3 Energy</span>. You currently
            have{" "}
            <span className="text-text-primary font-black">{currentEnergy} Energy</span>.
          </p>
        </div>

        <div className="p-3.5 bg-bg-primary border-[2px] border-border rounded-xl text-xs text-text-secondary font-medium w-full text-left leading-relaxed">
          ⚡ Energy regenerates automatically (+1 per 20 mins) or can be refilled in your profile.
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link
            href="/study"
            className="w-full py-3 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            BACK TO STUDY CENTER
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border-[2px] border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-muted transition-all cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
