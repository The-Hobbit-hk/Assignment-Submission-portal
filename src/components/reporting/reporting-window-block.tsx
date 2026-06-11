"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportingClosedDialog } from "@/components/reporting/reporting-closed-dialog";
import { useReportingWindow } from "@/hooks/use-reporting-window";

export function ReportingWindowBlock({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { data: window, isLoading } = useReportingWindow(month, year);
  const [dialogOpen, setDialogOpen] = useState(false);

  const closed = window && !window.open;

  useEffect(() => {
    if (closed) setDialogOpen(true);
  }, [closed]);

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) router.push("/dashboard/reporting");
  };

  if (isLoading) {
    return <Skeleton className="mx-auto h-96 max-w-3xl rounded-2xl" />;
  }

  if (closed) {
    return (
      <>
        <ReportingClosedDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          message={window.message}
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Reporting is currently closed</p>
          <p className="mt-2 text-sm text-muted-foreground">
            You will be returned to Monthly Reporting.
          </p>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
