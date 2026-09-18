// Auth proxy Route Handler — proxies NestJS auth endpoints and sets httpOnly cookies
// Handles: POST /auth/register, /auth/login, /auth/refresh, /auth/logout
// Sets accessToken + refreshToken as httpOnly Secure cookies; never exposes raw JWTs to client

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-client";

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Convert a simple duration string (e.g. "1d", "7d", "15m") to seconds. */
function durationToSeconds(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  if (isNaN(value)) return 86400; // default 1d
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 60 * 60;
    case "d": return value * 60 * 60 * 24;
    default:  return value;
  }
}

const ACCESS_TOKEN_MAX_AGE = durationToSeconds(process.env.JWT_EXPIRATION || "1d");
const REFRESH_TOKEN_MAX_AGE = durationToSeconds(process.env.JWT_REFRESH_EXPIRATION || "7d");

interface AuthResponseData {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

async function setCookiesFromResponse(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  data: AuthResponseData
) {
  if (data.accessToken && typeof data.accessToken === "string") {
    cookieStore.set({ name: "accessToken", value: data.accessToken, ...COOKIE_DEFAULTS, maxAge: ACCESS_TOKEN_MAX_AGE });
  }
  if (data.refreshToken && typeof data.refreshToken === "string") {
    cookieStore.set({ name: "refreshToken", value: data.refreshToken, ...COOKIE_DEFAULTS, maxAge: REFRESH_TOKEN_MAX_AGE });
  }
  if (data.user?.role && typeof data.user.role === "string") {
    cookieStore.set({ name: "role", value: data.user.role, ...COOKIE_DEFAULTS });
  }
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.proxy.join("/");
  const cookieStore = await cookies();

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // --- /auth/refresh ---
  // Read the refreshToken from the httpOnly cookie, not the request body.
  // The client never has access to the raw token.
  if (path === "refresh") {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token cookie found. Please log in again." },
        { status: 401 }
      );
    }
    body = { refreshToken };
  }

  // --- /auth/logout ---
  // Also read refreshToken from cookie for the NestJS logout call (which blacklists the jti).
  if (path === "logout") {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (refreshToken) {
      body = { refreshToken };
    }
    // Always clear session cookies regardless of whether the NestJS call succeeds
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("role");
  }

  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  let data: AuthResponseData = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // On logout, we've already cleared cookies — return 200 anyway so the client
    // can still redirect the user to the login page cleanly.
    if (path === "logout") {
      return NextResponse.json({ ok: true });
    }
    if (path === "refresh") {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      cookieStore.delete("role");
    }
    return NextResponse.json(data, { status: response.status });
  }

  await setCookiesFromResponse(cookieStore, data);

  // Strip raw tokens before returning to client
  const safeData = { ...data };
  delete safeData.accessToken;
  delete safeData.refreshToken;

  return NextResponse.json(safeData);
}
