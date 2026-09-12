"use client";

import React, { useState } from "react";
import { Zap, ArrowLeft, ArrowRight, Gem, Loader2, Sparkles, X, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useStats } from "@/components/providers/stats-provider";
import { useConvertDiamondsToEnergy } from "@/features/gamification/hooks";

interface EnergyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEnergy?: number;
  onRefillSuccess?: () => void;
}

const DIAMOND_COST = 5;
const ENERGY_GAINED = 15;

export function EnergyWarningModal({
  isOpen,
  onClose,
  currentEnergy,
  onRefillSuccess,
}: EnergyWarningModalProps) {
  const { gems, energy: statsEnergy } = useStats();
  const convertMutation = useConvertDiamondsToEnergy();
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const effectiveEnergy = typeof currentEnergy === "number" ? currentEnergy : statsEnergy;
  const canAfford = gems >= DIAMOND_COST;

  const handleConvert = () => {
    if (!canAfford) {
      toast.error(`Insufficient Diamonds! You need at least ${DIAMOND_COST} 💎 to convert to energy.`);
      return;
    }

    convertMutation.mutate(DIAMOND_COST, {
      onSuccess: (data) => {
        setIsSuccess(true);
        toast.success(`⚡ Converted ${DIAMOND_COST} Diamonds into +${ENERGY_GAINED} Energy! (Current: ${data.current}/${data.max})`);
        setTimeout(() => {
          setIsSuccess(false);
          onRefillSuccess?.();
          onClose();
        }, 600);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to convert diamonds to energy");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141827]/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border-[3px] border-border rounded-3xl shadow-[0_8px_0_rgba(20,24,39,0.95)] p-6 md:p-7 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200 relative">
        {/* Top Header Bar: Status Badges & Close Button */}
        <div className="w-full flex items-center justify-between gap-2">
          {/* Energy Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF6] border-2 border-border rounded-xl shadow-[0_2px_0_#141827] text-xs font-black text-text-primary">
            <Zap size={14} strokeWidth={2.5} className="fill-[#FF9E2C] text-[#FF9E2C]" />
            <span>{effectiveEnergy}/30 Energy</span>
          </div>

          {/* Diamonds Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF6] border-2 border-border rounded-xl shadow-[0_2px_0_#141827] text-xs font-black text-text-primary">
            <Gem size={14} strokeWidth={2.5} className="fill-[#2B82FB] text-text-primary" />
            <span>{gems} Diamonds</span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl border-2 border-border bg-surface hover:bg-surface-muted transition-all active:translate-y-0.5 cursor-pointer shadow-[0_2px_0_#141827] shrink-0 ml-auto"
          >
            <X size={16} strokeWidth={2.5} className="text-text-primary" />
          </button>
        </div>

        {/* Center Illustration */}
        <div className="relative my-1">
          <div className="w-24 h-24 rounded-3xl bg-[#FFF9E6] border-[3px] border-border flex items-center justify-center shadow-[0_5px_0_#141827]">
            <div className="w-16 h-16 rounded-2xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
              <Zap size={34} strokeWidth={2.5} className="fill-[#E28743] text-text-primary animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-surface border-2.5 border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
            <Gem size={18} strokeWidth={2.5} className="fill-[#2B82FB] text-text-primary" />
          </div>
        </div>

        {/* Title & Copy */}
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black text-text-primary tracking-tight">
            Out of Energy!
          </h3>
          <p className="text-xs font-bold text-text-secondary leading-relaxed max-w-xs">
            Starting a quiz requires <span className="text-text-primary font-black">3 Energy</span>. Convert your diamonds to recharge instantly and keep learning.
          </p>
        </div>

        {/* Conversion Exchange Card */}
        <div className="w-full bg-bg-secondary border-[2.5px] border-border rounded-2xl p-4 shadow-[0_3px_0_rgba(20,24,39,0.9)] flex items-center justify-between gap-2">
          {/* Diamond Cost */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0">
              <Gem size={22} strokeWidth={2.2} className="fill-[#2B82FB] text-text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-text-primary">{DIAMOND_COST} Diamonds</div>
              <div className="text-xs font-bold text-text-secondary">Balance: {gems} 💎</div>
            </div>
          </div>

          {/* Exchange Arrow */}
          <div className="w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827] shrink-0">
            <ArrowRight size={14} strokeWidth={3} />
          </div>

          {/* Energy Gained */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary border-2 border-border flex items-center justify-center text-text-primary shadow-[0_2px_0_#141827] shrink-0">
              <Zap size={22} strokeWidth={2.5} className="fill-text-primary text-text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-text-primary">+{ENERGY_GAINED} Energy</div>
              <div className="text-xs font-bold text-[#1e6122]">Instant refill</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full pt-1">
          {/* Primary CTA Button: Yellow per Design System */}
          <button
            type="button"
            disabled={!canAfford || convertMutation.isPending || isSuccess}
            onClick={handleConvert}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm border-[2.5px] border-border flex items-center justify-center gap-2 shadow-[0_4px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all cursor-pointer ${
              canAfford
                ? "bg-primary hover:bg-[#ebd060] text-text-primary hover:-translate-y-0.5"
                : "bg-surface-muted text-text-secondary opacity-70 cursor-not-allowed shadow-[0_2px_0_#141827]"
            }`}
          >
            {convertMutation.isPending ? (
              <>
                <Loader2 size={18} strokeWidth={3} className="animate-spin text-text-primary" />
                <span>CONVERTING DIAMONDS…</span>
              </>
            ) : isSuccess ? (
              <>
                <Sparkles size={18} strokeWidth={2.5} className="text-text-primary" />
                <span>REFILLED +{ENERGY_GAINED} ENERGY!</span>
              </>
            ) : canAfford ? (
              <>
                <Gem size={18} strokeWidth={2.5} className="fill-[#2B82FB] text-text-primary" />
                <span>CONVERT {DIAMOND_COST} DIAMONDS (+{ENERGY_GAINED} 🔋)</span>
              </>
            ) : (
              <span>NOT ENOUGH DIAMONDS (NEED {DIAMOND_COST} 💎)</span>
            )}
          </button>

          {/* Secondary Actions Row */}
          <div className="flex items-center gap-3 w-full">
            <Link
              href="/study"
              onClick={onClose}
              className="flex-1 py-3 bg-surface hover:bg-surface-muted text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span>Study Center</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-surface-muted hover:bg-[#e4ded3] text-text-secondary hover:text-text-primary border-2 border-border rounded-xl font-black text-xs shadow-[0_3px_0_#141827] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#141827] transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Passive Regen Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-text-secondary pt-1">
          <Clock size={13} strokeWidth={2.5} />
          <span>Energy regenerates automatically (+1 per 20 mins)</span>
        </div>
      </div>
    </div>
  );
}
