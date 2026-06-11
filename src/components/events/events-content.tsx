"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

/** Legacy route — events browsing lives under Events Reporting. */
export function EventsContent() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/reporting/events");
  }, [router]);

  return <Skeleton className="h-64 w-full" />;
}
