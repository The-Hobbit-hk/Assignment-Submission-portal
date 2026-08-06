"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminReportDraftBanner({
  periodLabel,
  className,
}: {
  periodLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "depth-card flex items-start gap-4 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-50/90 to-orange-50/40 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 shadow-sm">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-amber-900">Admin report saved as draft</p>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            Action required
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-amber-900/85">
          You have started your {periodLabel} admin report (for example by uploading a document),
          but it is <span className="font-medium">not submitted yet</span>. Complete all required
          fields below and click <span className="font-medium">Submit</span> so the district can
          review it.
        </p>
      </div>
    </div>
  );
}
