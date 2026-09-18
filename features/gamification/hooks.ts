// features/gamification/hooks.ts — TanStack Query hooks for gamification data

"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/features/auth/hooks";
import { isGuestIdentity } from "@/features/auth/types";
import { useStats } from "@/components/providers/stats-provider";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import { safeStorage } from "@/lib/storage";
import { ACHIEVEMENT_DEFINITIONS } from "./constants";
import type { AchievementItem } from "./components/AchievementCard";
import {
  claimQuestReward,
  getDashboard,
  getEnergy,
  getLeaderboard,
  getQuestCatalog,
  getStreak,
  getUserQuests,
  refillEnergy,
  convertDiamondsToEnergy,
} from "./api";
import type { UserQuest } from "./types";

const QUESTS_STORAGE_KEY = "wassce_cached_quests";

export function useQuests() {
  return useQuery<UserQuest[]>({
    queryKey: ["quests", "user"],
    queryFn: async () => {
      const data = await getUserQuests();
      if (typeof window !== "undefined" && Array.isArray(data)) {
        safeStorage.setItem(QUESTS_STORAGE_KEY, data);
      }
      return data;
    },
    placeholderData: () => {
      if (typeof window === "undefined") return undefined;
      return safeStorage.getItem<UserQuest[] | null>(QUESTS_STORAGE_KEY, null) ?? undefined;
    },
    staleTime: 30 * 1000,
    // Retry up to 3 times with exponential backoff to handle intermittent
    // Neon WebSocket / cold-start failures on the backend
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useQuestCatalog() {
  return useQuery({
    queryKey: ["quests", "catalog"],
    queryFn: getQuestCatalog,
    staleTime: 60 * 1000,
  });
}

export function useClaimQuestReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodId: string) => claimQuestReward(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["gamification", "dashboard"],
    queryFn: getDashboard,
    staleTime: 30 * 1000,
  });
}

export function useEnergy() {
  return useQuery({
    queryKey: ["gamification", "energy"],
    queryFn: getEnergy,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // periodic refetch to sync timer
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ["gamification", "streak"],
    queryFn: getStreak,
    staleTime: 60 * 1000,
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ["quests", "user"],
    queryFn: getUserQuests,
    staleTime: 30 * 1000,
  });
}

export function useLeaderboard(params?: {
  scope?: "global" | "subject";
  subjectId?: string;
  week?: string;
}) {
  // Don't fetch when scope=subject but no subjectId has been selected yet
  // (avoids a 400/404 during the subject-tab render before the useEffect fires)
  const isReady =
    params?.scope !== "subject" || Boolean(params?.subjectId);

  return useQuery({
    queryKey: ["gamification", "leaderboard", params],
    queryFn: () => getLeaderboard(params),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: isReady,
    // Retry up to 3 times with exponential backoff to handle intermittent
    // Neon WebSocket / cold-start failures on the backend
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useRefillEnergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refillEnergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useConvertDiamondsToEnergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (diamonds?: number) => convertDiamondsToEnergy(diamonds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

/**
 * Encapsulates full achievement tracking, server quests mapping,
 * localStorage claim persistence, and reward claim mutations.
 */
export function useAchievements() {
  const { data: me, isLoading: isLoadingAuth } = useMe();
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalyticsOverview(undefined, "all");
  const { data: serverQuests } = useQuests();
  const { addXp, addGems, streak: localStreak, completedQuizzes: localQuizzes } = useStats();
  const claimMutation = useClaimQuestReward();

  const isGuest = !me || isGuestIdentity(me);
  const userId = !isGuest ? me.id : me && isGuestIdentity(me) ? me.sessionId : "guest";

  const storageKey = `wassce_claimed_achievements_${userId}`;
  const [claimedLocalIds, setClaimedLocalIds] = useState<Record<string, boolean>>(() =>
    safeStorage.getItem<Record<string, boolean>>(storageKey, {})
  );
  const [prevUserId, setPrevUserId] = useState(userId);

  // Sync state if user identity switches without cascading effect renders
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setClaimedLocalIds(safeStorage.getItem<Record<string, boolean>>(storageKey, {}));
  }

  // Genuine Metric Values
  const realQuizzes =
    analytics?.snapshot?.quizzesCompleted ??
    (localQuizzes > 0 ? localQuizzes : 0);

  const realStreak =
    dashboard?.streak?.longest ??
    dashboard?.streak?.current ??
    localStreak ??
    0;

  // Synthesize genuine achievement items
  const items: AchievementItem[] = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      // Check if server quest matches
      const serverMatch = serverQuests?.find(
        (q) => q.slug === def.id || q.title.toLowerCase() === def.title.toLowerCase()
      );

      let current = 0;
      let isUnlocked = false;
      let canClaim = false;

      if (serverMatch) {
        current = serverMatch.currentCount ?? 0;
        if (serverMatch.rewardClaimed || claimedLocalIds[def.id]) {
          isUnlocked = true;
        } else if (serverMatch.completed || current >= def.targetCount) {
          canClaim = true;
        }
      } else {
        // Compute from genuine live data
        switch (def.metricKey) {
          case "quizzes":
            current = realQuizzes;
            break;
          case "streak":
            current = realStreak;
            break;
          default:
            current = 0;
            break;
        }

        if (claimedLocalIds[def.id]) {
          isUnlocked = true;
        } else if (current >= def.targetCount) {
          canClaim = true;
        }
      }

      const isLocked = !isUnlocked && !canClaim && Boolean(def.lockRequirement && current === 0);

      const status: "IN_PROGRESS" | "CAN_CLAIM" | "UNLOCKED" | "LOCKED" = isUnlocked
        ? "UNLOCKED"
        : canClaim
        ? "CAN_CLAIM"
        : isLocked
        ? "LOCKED"
        : "IN_PROGRESS";

      return {
        ...def,
        currentCount: current,
        status,
      };
    });
  }, [serverQuests, claimedLocalIds, realQuizzes, realStreak]);

  // Handle claiming rewards
  const handleClaim = useCallback((item: AchievementItem) => {
    addXp(item.xpAward, `Achievement: ${item.title}`);
    if (item.gemsAward) {
      addGems(item.gemsAward);
    }

    const updated = { ...claimedLocalIds, [item.id]: true };
    setClaimedLocalIds(updated);
    safeStorage.setItem(storageKey, updated);

    const serverMatch = serverQuests?.find(
      (q) => q.slug === item.id || q.title.toLowerCase() === item.title.toLowerCase()
    );
    if (serverMatch && serverMatch.periodId) {
      claimMutation.mutate(serverMatch.periodId, {
        onSuccess: () => {
          toast.success(`Claimed ${item.title}! +${item.xpAward} XP`);
        },
      });
    } else {
      toast.success(`Claimed ${item.title}! +${item.xpAward} XP`);
    }
  }, [addXp, addGems, claimedLocalIds, storageKey, serverQuests, claimMutation]);

  const unlockedCount = items.filter((i) => i.status === "UNLOCKED").length;
  const isLoading = isLoadingAuth || isLoadingDashboard || isLoadingAnalytics;

  return {
    items,
    unlockedCount,
    totalCount: items.length,
    handleClaim,
    isLoading,
    isGuest,
    me,
  };
}
