// features/auth/api.ts — typed API calls for auth endpoints
// All calls go through the Next.js Route Handler proxies so httpOnly cookies
// are never exposed to client-side JavaScript.

import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import type { MeResponse } from "./types";
import { isGuestIdentity } from "./types";
import { safeStorage } from "@/lib/storage";

export const AUTH_STORAGE_KEY = "auth_user";

// ── /me ───────────────────────────────────────────────────────────────────────

/** Fetch the current user (or guest identity) from the secure Next.js proxy. Returns null when unauthenticated. */
export async function fetchCurrentUser(): Promise<MeResponse | null> {
  try {
    const data = await apiGet<MeResponse>("/api/users/me");
    if (data && !isGuestIdentity(data)) {
      safeStorage.setItem(AUTH_STORAGE_KEY, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    throw err;
  }
}

// ── Auth mutations ────────────────────────────────────────────────────────────

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ user?: MeResponse }> {
  const res = await apiPost<{ user?: MeResponse }>("/api/auth/login", credentials);
  if (res?.user && !isGuestIdentity(res.user)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
  }
  return res;
}

export async function registerUser(data: {
  email: string;
  password: string;
}): Promise<{ user?: MeResponse }> {
  const res = await apiPost<{ user?: MeResponse }>("/api/auth/register", data);
  if (res?.user && !isGuestIdentity(res.user)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
  }
  return res;
}

export async function requestPasswordReset(data: { email: string }): Promise<void> {
  await apiPost<void>("/api/auth/request-password-reset", data);
}

export async function logoutUser(): Promise<void> {
  safeStorage.removeItem(AUTH_STORAGE_KEY);
  try {
    await apiPost<void>("/api/auth/logout");
  } catch {
    // Best-effort — the proxy always clears cookies even on failure
    console.warn("[auth] logout request failed, cookies may still be cleared");
  }
}

export async function refreshToken(): Promise<void> {
  try {
    await apiPost<void>("/api/auth/refresh");
  } catch {
    throw new Error("Session expired. Please log in again.");
  }
}

/** Fetches the active auth token for WebSocket connections. */
export async function fetchAuthToken(): Promise<string> {
  const data = await apiGet<{ token: string }>("/api/auth/token");
  if (!data?.token) {
    throw new Error("Failed to fetch auth token");
  }
  return data.token;
}

export async function mergeGuestSession(_anonymousToken: string): Promise<void> {
  // TODO: implement once merge-guest endpoint accepts anonymous token in body
}
