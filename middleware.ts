// middleware.ts — route-level auth/role redirect (coarse gate only)
// Fine-grained permission checks happen at component level via lib/permissions.ts
//
// Guard matrix per architecture doc §2 / §4:
//   (auth)/*     → redirect to /dashboard if already authenticated
//   (public)/*   → always accessible (no guard)
//   (app)/*      → redirect to /login if no session (accessToken OR anonymousToken)
//   (teacher)/*  → redirect to /dashboard if role !== 'Teacher' && role !== 'Admin'
//   (admin)/*    → redirect to /dashboard if role !== 'Admin'
//
// NOTE: This is coarse gating only — a Teacher hitting /admin/questions/review
// must be redirected BEFORE any render (not just nav-item hiding).
// TODO: implement once cookie names are confirmed from auth Route Handler

import { type NextRequest, NextResponse } from "next/server";

export async function middleware(_request: NextRequest): Promise<NextResponse> {
  // TODO:
  // 1. Read accessToken + role from cookies (httpOnly, so readable in middleware)
  // 2. Apply guard matrix above
  // 3. Redirect as needed; pass through on ok
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
