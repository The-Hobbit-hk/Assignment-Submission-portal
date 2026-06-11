import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-[520px] rounded-2xl lg:col-span-3" />
        <Skeleton className="h-[520px] rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
