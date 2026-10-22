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

// Routes requiring Admin role
const ADMIN_ROUTES = [
  "/questions/review",
  "/audit-logs",
  "/schools",
  "/users",
];

// Routes requiring Teacher or Admin role
const TEACHER_ROUTES = [
  "/questions",
];

// Auth routes (redirect to /dashboard if already logged in)
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("role")?.value;
  const guestToken = request.cookies.get("guestToken")?.value || request.cookies.get("anonymousToken")?.value;

  // Authenticated if the user has an active access token or a valid refresh token
  const isAuthenticated = !!accessToken || !!refreshToken;
  const hasGuestSession = !!guestToken;
  const hasAnySession = isAuthenticated || hasGuestSession;


  const normalizedRole = role?.toUpperCase();
  const isAdmin = normalizedRole === "ADMIN";
  const isTeacherOrAdmin = normalizedRole === "TEACHER" || isAdmin;

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

  // 2. Admin routes check (highest privilege required)
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Teacher routes check (excluding /questions/review which is already caught above)
  if (TEACHER_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isTeacherOrAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Auth-only routes check (e.g. /profile, /history): require full account
  if (AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. General protected routes check: require either user auth or guest session
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!hasAnySession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
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

