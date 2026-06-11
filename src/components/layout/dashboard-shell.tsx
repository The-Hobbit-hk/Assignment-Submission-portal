"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell dashboard-gradient flex min-h-screen text-sm">
      <div className="hidden lg:block">
        <AppSidebar className="fixed left-0 top-0 z-30 h-screen" />
      </div>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[var(--sidebar-width)]">
        <AppNavbar />
        <main className="flex-1 bg-background p-3 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
