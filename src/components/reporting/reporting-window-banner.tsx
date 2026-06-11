"use client";

import { AlertCircle, CalendarCheck } from "lucide-react";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { cn } from "@/lib/utils";

export function ReportingWindowBanner({
  month,
  year,
  className,
}: {
  month: number;
  year: number;
  className?: string;
}) {
  const { data } = useReportingWindow(month, year);

  if (!data) return null;

  const open = data.open;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        open
          ? "border-green-500/30 bg-green-500/10 text-green-700"
          : "border-destructive/30 bg-destructive/10 text-destructive",
        className
      )}
    >
      {open ? (
        <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div>
        <p className="font-medium">
          {open ? "Reporting window is open" : "Reporting window is closed"}
        </p>
        <p className="mt-0.5 text-xs opacity-90">
          {open
            ? "Submissions accepted from the 1st to the 10th of each month."
            : data.message}
        </p>
      </div>
    </div>
  );
}
