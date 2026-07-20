// AppShellLayout — Server Component: reads session cookie, resolves user/guest, renders nav
// Wraps all authenticated + guest routes; handles guest-merge trigger on login
// See architecture doc §2 and §3.3
export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  // TODO: read session cookie via lib/session.ts, call GET /users/me, pass user via context
  return <>{children}</>;
}
