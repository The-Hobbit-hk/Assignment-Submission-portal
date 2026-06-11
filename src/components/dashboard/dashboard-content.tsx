"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export function DashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="md:col-span-2 lg:col-span-3">
        <CalendarWidget events={data.calendarEvents} />
      </div>
      <div className="lg:col-span-2">
        <Leaderboard entries={data.leaderboard} />
      </div>
    </div>
  );
}
