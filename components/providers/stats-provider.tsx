"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/features/gamification/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface StatsContextType {
  xp: number;
  totalXp: number;
  levelXp: number;
  gems: number;
  streak: number;
  energy: number;
  maxEnergy: number;
  completedQuizzes: number;
  addXp: (amount: number, reason: string) => void;
  addGems: (amount: number) => void;
  deductEnergy: (amount?: number) => void;
  incrementCompletedQuizzes: () => void;
  setStreak: (streak: number) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { data: dashboardData } = useDashboard();
  const queryClient = useQueryClient();

  const totalXp = dashboardData?.xp?.total ?? dashboardData?.xp?.current ?? 0;
  const levelXp = dashboardData?.xp?.current ?? 0;
  const xp = totalXp;
  const gems = dashboardData?.wallet?.gems ?? 0;
  const streak = dashboardData?.streak?.current ?? 0;
  const energy = dashboardData?.energy?.current ?? 30;
  const maxEnergy = dashboardData?.energy?.max ?? 30;
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  const addXp = (amount: number, reason: string) => {
    toast.success(`+${amount} XP: ${reason}!`);
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  };

  const addGems = (_amount: number) => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  };

  const deductEnergy = () => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  };

  const incrementCompletedQuizzes = () => {
    setCompletedQuizzes((prev) => prev + 1);
  };

  const setStreak = (_newStreak: number) => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  };

  return (
    <StatsContext.Provider
      value={{
        xp,
        totalXp,
        levelXp,
        gems,
        streak,
        energy,
        maxEnergy,
        completedQuizzes,
        addXp,
        addGems,
        deductEnergy,
        incrementCompletedQuizzes,
        setStreak,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}
