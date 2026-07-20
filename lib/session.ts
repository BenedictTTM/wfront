// lib/session.ts — server-side cookie read helper (Server Components only)
// Reads accessToken and anonymousToken from httpOnly cookies set by the auth proxy Route Handler.
// Called in (app)/layout.tsx and (teacher)/(admin) layout.tsx to resolve session before render.
// Never import this file from a Client Component — cookies() is server-only.
// TODO: implement once cookie names/shapes are confirmed from auth Route Handler

import { cookies } from "next/headers";

export type SessionState =
  | { type: "authenticated"; accessToken: string }
  | { type: "guest"; anonymousToken: string }
  | { type: "unauthenticated" };

/**
 * Reads the current session state from httpOnly cookies.
 * Returns the session type and relevant token for API calls.
 */
export async function getSession(): Promise<SessionState> {
  // TODO: read cookies, determine session type, return appropriate state
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const anonymousToken = cookieStore.get("anonymousToken")?.value;

  if (accessToken) return { type: "authenticated", accessToken };
  if (anonymousToken) return { type: "guest", anonymousToken };
  return { type: "unauthenticated" };
}

/**
 * Returns true if a guest cookie exists (used to trigger merge on login).
 */
export async function hasGuestSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("anonymousToken")?.value;
}
