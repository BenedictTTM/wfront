// features/gamification/components/BadgesModal.tsx

"use client";

import React from "react";
import Image from "next/image";
import { X, Lock, CheckCircle2 } from "lucide-react";
import { BADGES_COLLECTION } from "../constants";
import { getPrestigeCrestPath } from "../assets";

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCrestNames?: Set<string>;
}

export function BadgesModal({ isOpen, onClose, unlockedCrestNames }: BadgesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] bg-surface border-2.5 border-border rounded-2xl p-4 sm:p-6 shadow-offset flex flex-col gap-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-border pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border flex items-center justify-center font-black text-lg shadow-[0_2px_0_#141827] shrink-0">
              🎖️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text-primary">
                Academic Honor Badges & Crests
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-text-secondary">
                Prestige crests permanently unlocked through Tier 3 academic mastery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BADGES_COLLECTION.map((b) => {
              const isUnlocked = Boolean(
                unlockedCrestNames?.has(b.name) ||
                unlockedCrestNames?.has(b.id)
              );
              const crestSrc = getPrestigeCrestPath(b.id) || getPrestigeCrestPath(b.name);

              const rarityBadgeStyle =
                b.rarity === "LEGENDARY"
                  ? "bg-amber-100 text-amber-900 border-amber-400 font-black"
                  : b.rarity === "EPIC"
                  ? "bg-purple-100 text-purple-900 border-purple-400 font-black"
                  : "bg-blue-100 text-blue-900 border-blue-400 font-black";

              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border-2 border-border flex flex-col justify-between gap-2.5 shadow-sm transition-all ${
                    isUnlocked
                      ? "bg-[#FFFDEB] ring-2 ring-amber-400/60"
                      : "bg-bg-secondary opacity-85"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-surface border-2 border-border flex items-center justify-center shrink-0 shadow-[0_1.5px_0_#141827] overflow-hidden p-1">
                      {crestSrc ? (
                        <Image
                          src={crestSrc}
                          alt={b.name}
                          width={40}
                          height={40}
                          className={`w-9 h-9 object-contain ${
                            isUnlocked ? "" : "grayscale opacity-50"
                          }`}
                        />
                      ) : (
                        <span className="text-2xl">{b.icon}</span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${rarityBadgeStyle}`}>
                      {b.rarity}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-text-primary leading-tight">
                        {b.name}
                      </h4>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-text-secondary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-text-secondary mt-1 leading-snug">
                      {b.description}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-text-primary bg-surface px-2 py-1 rounded border border-border/40 flex items-center justify-between">
                      <span className="truncate">Tier 3: {b.requirement}</span>
                      {isUnlocked && (
                        <span className="text-emerald-700 font-black shrink-0 ml-1">UNLOCKED</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t-2 border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-border bg-primary hover:bg-primary/90 text-text-primary font-black text-xs shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          >
            Close Collection
          </button>
        </div>
      </div>
    </div>
  );
}
