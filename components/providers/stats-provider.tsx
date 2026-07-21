"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface StatsContextType {
  xp: number;
  gems: number;
  streak: number;
  completedQuizzes: number;
  addXp: (amount: number, reason: string) => void;
  addGems: (amount: number) => void;
  incrementCompletedQuizzes: () => void;
  setStreak: (streak: number) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(20);
  const [gems, setGems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedXp = localStorage.getItem("piply_xp");
      const savedGems = localStorage.getItem("piply_gems");
      const savedStreak = localStorage.getItem("piply_streak");
      const savedQuizzes = localStorage.getItem("piply_completed_quizzes");

      if (savedXp) setXp(parseInt(savedXp, 10));
      if (savedGems) setGems(parseInt(savedGems, 10));
      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedQuizzes) setCompletedQuizzes(parseInt(savedQuizzes, 10));
    } catch (e) {
      console.error("Failed to load stats from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("piply_xp", xp.toString());
      localStorage.setItem("piply_gems", gems.toString());
      localStorage.setItem("piply_streak", streak.toString());
      localStorage.setItem("piply_completed_quizzes", completedQuizzes.toString());
    } catch (e) {
      console.error("Failed to save stats to localStorage", e);
    }
  }, [xp, gems, streak, completedQuizzes, isLoaded]);

  const addXp = (amount: number, reason: string) => {
    setXp((prev) => {
      const nextXp = prev + amount;
      toast.success(`+${amount} XP: ${reason}!`);
      if (prev < 30 && nextXp >= 30) {
        toast.info("🏆 Leaderboards unlocked! You can now view and compete with other scholars.");
      }
      return nextXp;
    });
  };

  const addGems = (amount: number) => {
    setGems((prev) => prev + amount);
  };

  const incrementCompletedQuizzes = () => {
    setCompletedQuizzes((prev) => prev + 1);
  };

  return (
    <StatsContext.Provider
      value={{
        xp,
        gems,
        streak,
        completedQuizzes,
        addXp,
        addGems,
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
