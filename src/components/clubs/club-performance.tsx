"use client";

import { Medal, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubPerformance } from "@/hooks/use-clubs";

interface ClubPerformancePanelProps {
  clubId: string;
}

export function ClubPerformancePanel({ clubId }: ClubPerformancePanelProps) {
  const { data, isLoading } = useClubPerformance(clubId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <span className="text-2xl font-bold text-accent">{data.score}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance Score</p>
              <p className="text-lg font-semibold">out of 100</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Medal className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">District Rank</p>
              <p className="text-lg font-semibold">#{data.rank}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-accent" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.metrics.map((metric) => {
            const pct = Math.min(
              100,
              Math.round((metric.value / metric.target) * 100)
            );
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.label}</span>
                  <span className="text-muted-foreground">
                    {metric.value} / {metric.target} {metric.unit}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
