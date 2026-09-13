// app/api/users/me/route.ts — secure proxy for GET /users/me
// Reads the httpOnly accessToken cookie (inaccessible to client JS) and proxies
// to NestJS GET /users/me. On 401, delegates to the existing /api/auth/refresh
// proxy and retries once so the client never has to handle token rotation.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-client";

async function fetchMe(headers: Record<string, string>) {
  return fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    // Do not cache — always fresh on each Next.js route handler invocation
    cache: "no-store",
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const guestToken =
    cookieStore.get("guestToken")?.value ||
    cookieStore.get("anonymousToken")?.value;

  if (!accessToken && !guestToken) {
    return NextResponse.json(
      { message: "No active session. Please log in." },
      { status: 401 }
    );
  }

  const reqHeaders: Record<string, string> = {};
  if (accessToken) {
    reqHeaders["Authorization"] = `Bearer ${accessToken}`;
  } else if (guestToken) {
    reqHeaders["X-Guest-Token"] = guestToken;
  }

  let response = await fetchMe(reqHeaders);

  // On 401 with accessToken, attempt a silent token refresh via the auth proxy then retry once.
  if (response.status === 401 && accessToken) {
    const refreshRes = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/refresh`,
      { method: "POST" }
    );

    if (refreshRes.ok) {
      // The refresh proxy has already set new cookies — re-read them.
      const updatedCookies = await cookies();
      const newAccessToken = updatedCookies.get("accessToken")?.value;
      if (newAccessToken) {
        response = await fetchMe({ Authorization: `Bearer ${newAccessToken}` });
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      cookieStore.delete("role");
    }
    let errorBody: unknown = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }
    return NextResponse.json(errorBody, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
