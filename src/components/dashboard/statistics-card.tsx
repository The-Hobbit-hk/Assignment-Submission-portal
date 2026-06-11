import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatisticMetric } from "@/types/dashboard";

interface StatisticsCardProps {
  metric: StatisticMetric;
}

export function StatisticsCard({ metric }: StatisticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-bold text-foreground">
          {metric.value.toLocaleString()}
        </p>
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metric.percentage}%`,
                backgroundColor: metric.color,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {metric.percentage}% of target
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
