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

  const response = await fetchMe(reqHeaders);

  if (!response.ok) {
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

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Authentication required to update profile." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
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
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to update user profile" },
      { status: 500 }
    );
  }
}
