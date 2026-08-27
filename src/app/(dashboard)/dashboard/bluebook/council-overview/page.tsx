import { Suspense } from "react";
import { CouncilBluebookOverview } from "@/components/bluebook/council-bluebook-overview";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Council Bluebook Overview" };

export default function CouncilBluebookOverviewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <CouncilBluebookOverview />
    </Suspense>
  );
}
