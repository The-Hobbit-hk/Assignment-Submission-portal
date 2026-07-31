"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileBarChart2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportingClosedDialog } from "@/components/reporting/reporting-closed-dialog";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { useAdminReport, useEventsReportingPortal } from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { isClubUser } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const links = [
  {
    id: "events" as const,
    href: "/dashboard/reporting/events",
    title: "Events Reporting",
    description:
      "Document club events, upload minutes and photos, and report district participation.",
    icon: CalendarDays,
    accent: "from-rose-500 to-accent",
    iconBg: "bg-rose-500/10 text-accent",
  },
  {
    id: "admin" as const,
    href: "/dashboard/reporting/admin",
    title: "Admin Reporting",
    description:
      "Submit monthly club administration, finance, bylaws, and master budget.",
    icon: ClipboardList,
    accent: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
];

function CompletionBadge({ complete }: { complete: boolean }) {
  return (
    <Badge variant={complete ? "success" : "warning"}>
      {complete ? "Complete" : "Incomplete"}
    </Badge>
  );
}

export function ReportingHub() {
  const { month, year } = getActiveReportPeriod();
  const periodLabel = getReportingPeriodLabel(month, year);

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const { data: window } = useReportingWindow(month, year);
  const { data: adminReport } = useAdminReport({ month, year });
  const { data: eventsPortal } = useEventsReportingPortal(month, year);
  const reportingClosed = window && !window.open;
  const [dialogOpen, setDialogOpen] = useState(false);

  const adminComplete = adminReport?.status === "SUBMITTED";
  const eventsComplete =
    eventsPortal?.report?.status === "SUBMITTED" || (eventsPortal?.clubEvents.length ?? 0) > 0;
  const monthlyComplete = adminComplete && eventsComplete;

  const completionByLink = {
    events: eventsComplete,
    admin: adminComplete,
  };

  const handleCardClick = () => {
    if (reportingClosed) {
      setDialogOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ReportingClosedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={window?.message}
      />

      <div className="reporting-hero relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent shadow-sm">
            <FileBarChart2 className="h-3.5 w-3.5" />
            {periodLabel}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Monthly Reporting
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Submit your <span className="font-medium text-foreground">{periodLabel}</span> report
            during the first 10 days of the following month. Complete both events and admin
            reporting before the deadline.
          </p>
        </div>
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(217,30,92,0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      <ReportingWindowBanner month={month} year={year} />

      {clubUser && monthlyComplete && (
        <div className="depth-card flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium text-foreground">Monthly reporting complete</p>
            <p className="text-sm text-muted-foreground">
              Both admin and events reporting for {periodLabel} are on record.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => {
          const cardClassName = cn(
            "depth-card group relative overflow-hidden rounded-2xl p-5 sm:p-6",
            reportingClosed
              ? "cursor-not-allowed opacity-80"
              : "depth-card-interactive"
          );

          const cardInner = (
            <>
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
              />
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm",
                      item.iconBg,
                      reportingClosed && "opacity-60"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {clubUser && (
                      <CompletionBadge complete={completionByLink[item.id]} />
                    )}
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        reportingClosed
                          ? "bg-muted text-muted-foreground"
                          : "depth-btn-surface border-0"
                      )}
                    >
                      {reportingClosed ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                      )}
                    </span>
                  </div>
                </div>
                <h2
                  className={cn(
                    "mt-4 text-lg font-semibold text-foreground",
                    !reportingClosed && "group-hover:text-accent"
                  )}
                >
                  {item.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <p
                  className={cn(
                    "mt-4 text-xs font-semibold uppercase tracking-wide",
                    reportingClosed
                      ? "text-destructive"
                      : "text-accent opacity-0 transition group-hover:opacity-100"
                  )}
                >
                  {reportingClosed ? "Reporting closed" : "Open reporting →"}
                </p>
              </div>
            </>
          );

          if (reportingClosed) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={handleCardClick}
                className={cn(cardClassName, "w-full text-left")}
              >
                {cardInner}
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={cardClassName}>
              {cardInner}
            </Link>
          );
        })}
      </div>

      <div className="depth-card rounded-xl px-4 py-3 text-center text-xs text-muted-foreground sm:text-sm">
        Clubs report for the <span className="font-medium text-foreground">previous calendar month</span>{" "}
        between the <span className="font-medium text-foreground">1st and 10th</span> of the following month
        (e.g. June reporting in early July).
        {reportingClosed
          ? " The window is closed — you will be notified here when submissions reopen."
          : " Use the links above to submit your reports."}
      </div>
    </div>
  );
}
