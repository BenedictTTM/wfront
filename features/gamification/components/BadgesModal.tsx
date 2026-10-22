// features/gamification/components/BadgesModal.tsx

"use client";

import React from "react";
import { X } from "lucide-react";
import { BADGES_COLLECTION } from "../constants";

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BadgesModal({ isOpen, onClose }: BadgesModalProps) {
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
                Academic Honor Badges
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-text-secondary">
                Prestige crests unlocked through high performance and study consistency
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-border hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BADGES_COLLECTION.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border-2 border-border bg-bg-secondary flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-border uppercase bg-surface">
                    {b.rarity}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-text-primary">{b.name}</h4>
                  <p className="text-[11px] font-medium text-text-secondary mt-0.5 leading-tight">
                    {b.description}
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-text-primary bg-surface/70 px-2 py-1 rounded border border-border/40">
                    Requirement: {b.requirement}
                  </div>
                </div>
              </div>
            ))}
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
