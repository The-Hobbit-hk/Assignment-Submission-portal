import {
  Building2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@/types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Users,
  Calendar,
  Wallet,
};

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const Icon = iconMap[metric.icon] ?? Building2;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold text-foreground">{metric.value}</p>
        <div className="mt-1 flex items-center gap-1">
          {metric.trend === "up" && (
            <TrendingUp className="h-3 w-3 text-green-400" />
          )}
          {metric.trend === "down" && (
            <TrendingDown className="h-3 w-3 text-red-400" />
          )}
          <p
            className={cn(
              "text-xs",
              metric.trend === "up" && "text-green-400",
              metric.trend === "down" && "text-red-400",
              metric.trend === "neutral" && "text-muted-foreground"
            )}
          >
            {metric.change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
