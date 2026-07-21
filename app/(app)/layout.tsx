import { ClientLayout } from "./client-layout";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}

