// features/auth/hooks.ts — TanStack Query hooks for auth state and mutations
// All hooks call the Next.js proxy layer (features/auth/api.ts), never NestJS directly.
// "use client" — these are Client Component hooks

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  AUTH_STORAGE_KEY,
} from "./api";
import { isGuestIdentity, type AuthUser, type MeResponse } from "./types";
import { safeStorage } from "@/lib/storage";

// ── Query keys ────────────────────────────────────────────────────────────────

export const authKeys = {
  me: ["auth", "me"] as const,
} as const;

// ── Cache helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the cached authenticated user from storage synchronously, or null.
 */
export function getCachedUser(): MeResponse | null {
  if (typeof window === "undefined") return null;
  const user = safeStorage.getItem<MeResponse | null>(AUTH_STORAGE_KEY, null);
  if (user && !isGuestIdentity(user)) {
    return user;
  }
  return null;
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns the current user profile (or guest identity) from GET /api/users/me.
 *
 * - Checks cache first (initialData from safeStorage) so unnecessary queries are avoided.
 * - Long staleTime prevents repeated calls mid-session.
 * - 401 responses do NOT retry (token is deterministically absent/expired) and clear storage.
 */
export function useMe() {
  return useQuery<MeResponse | null, Error>({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    initialData: () => getCachedUser(),
    staleTime: 15 * 60 * 1000, // 15 min — user profile rarely changes mid-session
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      // Never retry auth errors — they are deterministic
      if (error.message.includes("401") || error.message.includes("session")) {
        safeStorage.removeItem(AUTH_STORAGE_KEY);
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Returns the authenticated user directly from cache if present (QueryClient or storage),
 * or from useMe(). Does not make extra network requests if user is already cached.
 */
export function useCurrentUser(): AuthUser | null {
  const queryClient = useQueryClient();
  const cachedFromQuery = queryClient.getQueryData<MeResponse | null>(authKeys.me);
  const { data } = useMe();

  const user = data ?? cachedFromQuery ?? getCachedUser();
  if (!user || isGuestIdentity(user)) return null;
  return user;
}

/** Canonical alias for useCurrentUser */
export const useUser = useCurrentUser;

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Login mutation. On success, writes the user to cache and safeStorage so
 * no immediate /api/users/me refetch is required.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      if (res?.user && !isGuestIdentity(res.user)) {
        queryClient.setQueryData(authKeys.me, res.user);
        safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
      } else {
        queryClient.invalidateQueries({ queryKey: authKeys.me });
      }
    },
  });
}

/**
 * Register mutation. On success, writes the user to cache and safeStorage.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => {
      if (res?.user && !isGuestIdentity(res.user)) {
        queryClient.setQueryData(authKeys.me, res.user);
        safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
      } else {
        queryClient.invalidateQueries({ queryKey: authKeys.me });
      }
    },
  });
}

/**
 * Request password reset mutation.
 */
export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

/**
 * Logout mutation. Clears all cached auth state and storage on success.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: authKeys.me });
    },
  });
}
