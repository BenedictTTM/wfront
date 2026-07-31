"use client";

import React from "react";
import { Zap, AlertTriangle, ArrowLeft } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center">
          <Zap size={28} className="fill-amber-500 text-amber-500" />
        </div>

        <div className="flex flex-col gap-1">
          <h4 className="text-lg font-black text-text-primary">Need More Energy!</h4>
          <p className="text-xs font-bold text-text-secondary">
            Starting a practice quiz requires <span className="text-text-primary font-black">3 Energy</span>. You currently have <span className="text-amber-500 font-black">{currentEnergy} Energy</span>.
          </p>
        </div>

        <div className="p-3 bg-surface-muted border-2 border-border rounded-xl text-xs text-text-secondary font-medium w-full">
          ⚡ Energy regenerates automatically over time (+1 per 20 mins) or can be refilled in your profile.
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          <Link
            href="/study"
            className="w-full py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl text-xs font-black shadow-[0_2.5px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>BACK TO STUDY CENTER</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 border-2 border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-muted transition-all cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
