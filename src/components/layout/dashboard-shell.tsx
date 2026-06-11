"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="dashboard-gradient flex min-h-screen">
      <div className="hidden lg:block">
        <AppSidebar className="fixed left-0 top-0 z-30 h-screen" />
      </div>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[var(--sidebar-width)]">
        <AppNavbar />
        <main className="flex-1 bg-[#0f0f11] p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
