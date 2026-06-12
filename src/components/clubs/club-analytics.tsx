"use client";

import { Award, BarChart3, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubAnalytics } from "@/hooks/use-clubs";

interface ClubAnalyticsPanelProps {
  clubId: string;
}

export function ClubAnalyticsPanel({ clubId }: ClubAnalyticsPanelProps) {
  const { data, isLoading } = useClubAnalytics(clubId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Members",
      value: data.totalMembers,
      sub: `${data.activeMembers} active`,
      icon: Users,
    },
    {
      label: "Total Events",
      value: data.totalEvents,
      sub: `${data.upcomingEvents} upcoming`,
      icon: Calendar,
    },
    {
      label: "Service Hours",
      value: data.totalServiceHours,
      sub: `${data.completedEvents} completed events`,
      icon: Clock,
    },
    {
      label: "Avg. Attendance",
      value: data.averageAttendance,
      sub: "per event",
      icon: BarChart3,
    },
    {
      label: "Citations Completed",
      value: data.citationsApproved,
      sub: `${data.citationPoints} pts · ${data.citationsSubmitted} pending review`,
      icon: Award,
    },
  ];

  const maxGrowth = Math.max(...data.memberGrowth.map((g) => g.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Member Growth (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-2">
            {data.memberGrowth.map((item) => (
              <div
                key={item.month}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t-md bg-accent/60 transition-all"
                  style={{
                    height: `${Math.max(8, (item.count / maxGrowth) * 120)}px`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {item.month}
                </span>
                <span className="text-xs font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
