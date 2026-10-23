"use client";

// providers.tsx — Client Component that wraps the app in all client-side providers
// Currently: TanStack Query (QueryClientProvider + ReactQueryDevtools)
// Add other providers here as needed (e.g. Toaster from sonner, auth context)

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { makeQueryClient } from "@/lib/query-client";
import { MultiplayerProvider, GlobalForfeitCountdown } from "@/features/multiplayer/hooks";

export function Providers({ children }: { children: React.ReactNode }) {
  // Stable QueryClient across renders — useState ensures it's created once per client mount
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MultiplayerProvider>
        <GlobalForfeitCountdown />
        {children}
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </MultiplayerProvider>
    </QueryClientProvider>
  );
}
