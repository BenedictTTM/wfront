"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMultiplayerToken } from "../hooks";
import { useMultiplayerWs, type UseMultiplayerWsReturn } from "../use-multiplayer-ws";
import { getQueueStatus } from "../api";
import { ForfeitCountdownBanner } from "../components/ForfeitCountdownBanner";
import Link from "next/link";
import { Swords, ArrowRight } from "lucide-react";
import { safeStorage } from "@/lib/storage";

const ACTIVE_MATCH_STORAGE_KEY = "mp_active_match_id";

export interface MultiplayerContextValue extends UseMultiplayerWsReturn {
  activeMatchId: string | null;
  setActiveMatchId: (matchId: string | null) => void;
  currentUserId: string | null;
  isLiveMatchPage: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: tokenData } = useMultiplayerToken();
  const token = tokenData?.token ?? null;
  const currentUserId = tokenData?.currentUserId ?? null;

  // Extract match ID from route path (e.g. /study/multiplayer/[matchId])
  const routeMatchId = useMemo(() => {
    if (!pathname || !pathname.startsWith("/study/multiplayer/")) return null;
    const parts = pathname.replace(/^\/study\/multiplayer\/?/, "").split("/");
    const candidate = parts[0];
    return candidate && candidate.length > 0 ? candidate : null;
  }, [pathname]);

  // Track active match ID across the application
  const [activeMatchId, setActiveMatchId] = useState<string | null>(routeMatchId);

  // Sync state from sessionStorage once mounted on client
  useEffect(() => {
    if (routeMatchId) {
      setActiveMatchId(routeMatchId);
      safeStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, routeMatchId);
    } else {
      const stored = safeStorage.getItemString(ACTIVE_MATCH_STORAGE_KEY, "");
      if (stored) {
        setActiveMatchId(stored);
      }
    }
  }, [routeMatchId]);

  // Periodically check queue & active match status from backend
  const { data: queueStatus } = useQuery({
    queryKey: ["multiplayer", "queue-status"],
    queryFn: getQueueStatus,
    enabled: Boolean(token),
    refetchInterval: (query) => {
      return query.state.data?.inQueue || activeMatchId ? 3000 : 15000;
    },
    staleTime: 0,
  });

  // Sync active match ID if discovered via backend queue status
  useEffect(() => {
    if (queueStatus?.matchId && !activeMatchId) {
      setActiveMatchId(queueStatus.matchId);
      safeStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, queueStatus.matchId);
    }
  }, [queueStatus?.matchId, activeMatchId]);

  // Connect to match WebSocket through the root provider
  const ws = useMultiplayerWs({
    token,
    matchId: activeMatchId,
    currentUserId,
  });

  // Clean up active match reference when match reaches terminal state
  useEffect(() => {
    if (ws.matchState === "FINISHED" || ws.matchState === "ABANDONED") {
      safeStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
    }
  }, [ws.matchState]);

  // Clean up active match if authentication token expires or user logs out
  useEffect(() => {
    if (!token) {
      setActiveMatchId(null);
      safeStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
    }
  }, [token]);

  const isLiveMatchPage = Boolean(
    activeMatchId && pathname === `/study/multiplayer/${activeMatchId}`
  );

  const contextValue = useMemo<MultiplayerContextValue>(
    () => ({
      ...ws,
      activeMatchId,
      setActiveMatchId,
      currentUserId,
      isLiveMatchPage,
    }),
    [ws, activeMatchId, currentUserId, isLiveMatchPage]
  );

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer(): MultiplayerContextValue {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return ctx;
}

/**
 * Global Root Forfeit Countdown & Duel Alert
 * Rendered at the app root level so it hovers cleanly across all pages.
 */
export function GlobalForfeitCountdown() {
  const [mounted, setMounted] = useState(false);
  const {
    disconnectGrace,
    matchState,
    currentUserId,
    activeMatchId,
    isLiveMatchPage,
    status,
  } = useMultiplayer();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isTerminal = matchState === "FINISHED" || matchState === "ABANDONED";

  // Case 1: Active disconnect grace forfeit timer
  if (disconnectGrace && !isTerminal) {
    const isCurrentUserDisconnected =
      disconnectGrace.disconnectedUserId === currentUserId ||
      disconnectGrace.disconnectedUserId === "me" ||
      status === "closed" ||
      status === "reconnecting";

    return (
      <aside
        aria-label="Match Forfeit Warning"
        className="fixed top-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 pointer-events-auto drop-shadow-xl animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <ForfeitCountdownBanner
          isCurrentUserDisconnected={isCurrentUserDisconnected}
          remainingSeconds={disconnectGrace.remainingSeconds}
          totalSeconds={30}
          matchId={activeMatchId}
          showReturnButton={!isLiveMatchPage}
        />
      </aside>
    );
  }

  // Case 2: User is navigating outside the duel page during active questions / round reveals
  if (
    activeMatchId &&
    !isLiveMatchPage &&
    !isTerminal &&
    (matchState === "QUESTION_ACTIVE" ||
      matchState === "ROUND_REVEAL" ||
      matchState === "STARTING")
  ) {
    return (
      <aside
        aria-label="Live Match Alert"
        className="fixed top-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 pointer-events-auto drop-shadow-xl animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[#F4D06F] p-3 sm:p-3.5 shadow-[0_4px_0_#141827] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border-[2px] border-black flex items-center justify-center shrink-0 text-black">
              <Swords size={18} strokeWidth={2.5} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-black">
                  Live Match in Progress
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
              </div>
              <p className="text-xs font-bold text-black/80 truncate">
                Your duel is active. Return to answer questions and avoid timeout.
              </p>
            </div>
          </div>

          <Link
            href={`/study/multiplayer/${activeMatchId}`}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-[2px] border-black bg-white hover:bg-[#F5F3EC] text-black font-black text-xs uppercase tracking-wider shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Return to Duel</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </aside>
    );
  }

  return null;
}
