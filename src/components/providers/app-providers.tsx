"use client";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthSessionProvider>
  );
}
