import { ClientLayout } from "./client-layout";
import { LockInProvider } from "@/features/mock-exam/lockin-context";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <LockInProvider>
      <ClientLayout>{children}</ClientLayout>
    </LockInProvider>
  );
}
