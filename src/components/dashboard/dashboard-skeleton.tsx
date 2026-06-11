import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Skeleton className="h-[420px] lg:col-span-3" />
      <div className="space-y-3 lg:col-span-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}
