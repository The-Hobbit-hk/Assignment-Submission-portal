"use client";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </AuthSessionProvider>
  );
}
