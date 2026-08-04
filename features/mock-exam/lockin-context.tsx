"use client";

// features/mock-exam/lockin-context.tsx
// Provides a React context that the mock exam page uses to signal the layout
// to enter immersive mode (hide sidebar, header, right panel).

import React, { createContext, useContext, useState, useCallback } from "react";

type LockInContextValue = {
  isLockInActive: boolean;
  setLockInActive: (active: boolean) => void;
};

const LockInContext = createContext<LockInContextValue>({
  isLockInActive: false,
  setLockInActive: () => {},
});

export function LockInProvider({ children }: { children: React.ReactNode }) {
  const [isLockInActive, setIsActive] = useState(false);

  const setLockInActive = useCallback((active: boolean) => {
    setIsActive(active);
    // Mirror to the document root so CSS attribute selectors can hide chrome
    if (typeof document !== "undefined") {
      if (active) {
        document.documentElement.setAttribute("data-lockin", "active");
      } else {
        document.documentElement.removeAttribute("data-lockin");
      }
    }
  }, []);

  return (
    <LockInContext.Provider value={{ isLockInActive, setLockInActive }}>
      {children}
    </LockInContext.Provider>
  );
}

export function useLockIn() {
  return useContext(LockInContext);
}
