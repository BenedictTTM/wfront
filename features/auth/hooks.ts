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
} from "./api";
import { isGuestIdentity, type AuthUser, type MeResponse } from "./types";

// ── Query keys ────────────────────────────────────────────────────────────────

export const authKeys = {
  me: ["auth", "me"] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns the current user profile (or guest identity) from GET /api/users/me.
 *
 * - Disabled (no fetch) when there is no session cookie.
 * - Returns `undefined` when unauthenticated so callers can branch cleanly.
 * - 401 responses do NOT retry (token is deterministically absent/expired).
 */
export function useMe() {
  return useQuery<MeResponse | null, Error>({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 min — user profile rarely changes mid-session
    retry: (failureCount, error) => {
      // Never retry auth errors — they are deterministic
      if (error.message.includes("401") || error.message.includes("session")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Convenience hook: returns the authenticated user, or `null` for guests/unauthed.
 * Prefer `useMe()` when you need to differentiate guest vs unauthenticated.
 */
export function useCurrentUser(): AuthUser | null {
  const { data } = useMe();
  if (!data || isGuestIdentity(data)) return null;
  return data as AuthUser;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Login mutation. On success, invalidates the `me` query so the profile
 * is refetched automatically from the next render.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Invalidate so useMe refetches the now-authenticated user
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

/**
 * Register mutation. On success, invalidates the `me` query.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

/**
 * Logout mutation. Clears all cached auth state on success.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Remove cached user — redirect handled by the calling component
      queryClient.removeQueries({ queryKey: authKeys.me });
    },
  });
}
