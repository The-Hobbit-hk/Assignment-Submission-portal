"use client";

import { CalendarDays, Trophy, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/hooks/use-dashboard";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { CitationStandingsWidget } from "@/components/dashboard/citation-standings-widget";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DISTRICT_ROLES, isClubUser } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export function DashboardContent() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const clubUser = isClubUser(role);
  const showMemberLeaderboard = DISTRICT_ROLES.includes(role);

  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="depth-card rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const eventCount = data.calendarEvents.length;
  const leaderCount = clubUser ? 0 : data.leaderboard.length;

  return (
    <div className="space-y-5">
      <div className="dashboard-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview for <span className="font-medium text-foreground">{monthLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="depth-btn-surface flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
              <CalendarDays className="h-4 w-4 text-accent" />
              <span>
                <span className="font-semibold text-foreground">{eventCount}</span> events this month
              </span>
            </div>
            {!clubUser && (
              <div className="depth-btn-surface flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>
                  <span className="font-semibold text-foreground">{leaderCount}</span> top scorers
                </span>
              </div>
            )}
            <div className="depth-btn-surface hidden items-center gap-2 rounded-lg px-3 py-2 text-xs sm:flex">
              <Users className="h-4 w-4 text-indigo-500" />
              <span className="text-muted-foreground">RID 3131</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
          <CalendarWidget events={data.calendarEvents} />
        </div>
        <div className="lg:col-span-2">
          {clubUser ? (
            <CitationStandingsWidget limit={5} />
          ) : showMemberLeaderboard ? (
            <div className="space-y-5">
              <Leaderboard entries={data.leaderboard} />
              <CitationStandingsWidget limit={5} />
            </div>
          ) : (
            <CitationStandingsWidget limit={5} />
          )}
        </div>
      </div>
    </div>
  );
}
