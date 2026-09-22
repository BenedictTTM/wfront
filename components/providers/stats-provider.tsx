"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/features/gamification/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { safeStorage } from "@/lib/storage";

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
  addGems: (amount?: number) => void;
  incrementCompletedQuizzes: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { data: dashboardData } = useDashboard();
  const queryClient = useQueryClient();

  const [cachedStats, setCachedStats] = useState({
    xp: 0,
    gems: 0,
    streak: 0,
    energy: 30,
  });

  React.useEffect(() => {
    setCachedStats({
      xp: safeStorage.getItem<number>("wassce_user_xp", 0),
      gems: safeStorage.getItem<number>("wassce_user_gems", 0),
      streak: safeStorage.getItem<number>("wassce_user_streak", 0),
      energy: safeStorage.getItem<number>("wassce_user_energy", 30),
    });
  }, []);

  const totalXp = dashboardData?.xp?.total ?? dashboardData?.xp?.current ?? cachedStats.xp;
  const levelXp = dashboardData?.xp?.current ?? 0;
  const xp = totalXp;
  const gems = dashboardData?.wallet?.gems ?? cachedStats.gems;
  const streak = dashboardData?.streak?.current ?? cachedStats.streak;
  const energy = dashboardData?.energy?.current ?? cachedStats.energy;
  const maxEnergy = dashboardData?.energy?.max ?? 30;

  // Persist fresh stats to storage whenever received from server
  React.useEffect(() => {
    if (dashboardData) {
      if (dashboardData.xp) {
        const freshXp = dashboardData.xp.total ?? dashboardData.xp.current ?? 0;
        safeStorage.setItem("wassce_user_xp", freshXp);
      }
      if (dashboardData.wallet) {
        safeStorage.setItem("wassce_user_gems", dashboardData.wallet.gems);
      }
      if (dashboardData.streak) {
        safeStorage.setItem("wassce_user_streak", dashboardData.streak.current);
      }
      if (dashboardData.energy) {
        safeStorage.setItem("wassce_user_energy", dashboardData.energy.current);
      }
    }
  }, [dashboardData]);

  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  const addXp = useCallback((amount: number, reason: string) => {
    toast.success(`+${amount} XP: ${reason}!`);
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  }, [queryClient]);

  const addGems = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  }, [queryClient]);

  const incrementCompletedQuizzes = useCallback(() => {
    setCompletedQuizzes((prev) => prev + 1);
  }, []);

  const value = useMemo<StatsContextType>(
    () => ({
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
      incrementCompletedQuizzes,
    }),
    [
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
      incrementCompletedQuizzes,
    ]
  );

  return (
    <StatsContext.Provider value={value}>
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
