import { type NextRequest, NextResponse } from "next/server";

// Routes that require either a logged-in user session (accessToken) or a guest session (guestToken / anonymousToken)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/study",
  "/quiz",
  "/history",
  "/profile",
  "/quests",
  "/leaderboard",
];

// Routes restricted to authenticated users only (guests should be redirected to login)
const AUTH_ONLY_ROUTES = [
  "/profile",
  "/history",
];

// Auth routes (redirect to /dashboard if already logged in)
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;
  const guestToken = request.cookies.get("guestToken")?.value || request.cookies.get("anonymousToken")?.value;

  const isAuthenticated = !!accessToken;
  const hasGuestSession = !!guestToken;
  const hasAnySession = isAuthenticated || hasGuestSession;

  // 0. Fallback convenience redirects
  if (pathname === "/signin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/signup") {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  // 1. Auth routes check: always allow /login and /register so users can log in or switch accounts
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Auth-only routes check (e.g. /profile, /history): require full account
  if (AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. General protected routes check: require either user auth or guest session
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!hasAnySession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Role-based checks
  if (pathname.startsWith("/teacher")) {
    if (!isAuthenticated || (role !== "Teacher" && role !== "Admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

