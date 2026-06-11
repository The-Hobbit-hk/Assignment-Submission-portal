"use client";

import { AlertCircle, CalendarCheck, Lock } from "lucide-react";
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
        "depth-card flex items-start gap-4 rounded-2xl p-4 sm:p-5",
        open
          ? "border-green-500/20 bg-gradient-to-r from-green-50/90 to-emerald-50/50"
          : "border-destructive/15 bg-gradient-to-r from-rose-50/90 to-red-50/40",
        className
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
          open ? "bg-green-500/15 text-green-600" : "bg-destructive/10 text-destructive"
        )}
      >
        {open ? <CalendarCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold",
              open ? "text-green-800" : "text-destructive"
            )}
          >
            {open ? "Reporting window is open" : "Reporting window is closed"}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              open ? "bg-green-500/15 text-green-700" : "bg-destructive/10 text-destructive"
            )}
          >
            {open ? "Active" : "Closed"}
          </span>
        </div>
        <p
          className={cn(
            "mt-1.5 text-sm leading-relaxed",
            open ? "text-green-700/90" : "text-destructive/85"
          )}
        >
          {open
            ? "Submissions accepted from the 1st to the 10th of each month. Complete both events and admin reporting before the deadline."
            : data.message}
        </p>
        {!open && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            You can still review past submissions from the reporting sections below.
          </p>
        )}
      </div>
    </div>
  );
}
