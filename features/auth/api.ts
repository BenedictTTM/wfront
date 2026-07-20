// features/auth/api.ts — typed API calls for auth endpoints
// All calls go through the Next.js Route Handler proxies so httpOnly cookies
// are never exposed to client-side JavaScript.

import type { MeResponse } from "./types";

const BASE = "/api";

// ── /me ───────────────────────────────────────────────────────────────────────

/** Fetch the current user (or guest identity) from the secure Next.js proxy. */
export async function fetchCurrentUser(): Promise<MeResponse> {
  const res = await fetch(`${BASE}/users/me`, {
    method: "GET",
    credentials: "include", // include cookies on same-origin requests
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as any)?.message ?? `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return res.json() as Promise<MeResponse>;
}

// ── Auth mutations ────────────────────────────────────────────────────────────

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as any)?.message ?? `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
}

export async function registerUser(data: {
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as any)?.message ?? `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    // Best-effort — the proxy always clears cookies even on failure
    console.warn("[auth] logout request failed, cookies may still be cleared");
  }
}

export async function refreshToken(): Promise<void> {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Session expired. Please log in again.");
  }
}

export async function mergeGuestSession(_anonymousToken: string): Promise<void> {
  // TODO: implement once merge-guest endpoint accepts anonymous token in body
}
