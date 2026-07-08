"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsBrowsingView } from "@/components/events/events-browsing-view";
import { ReportingFormLayout } from "@/components/reporting/reporting-form-layout";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { useEventsReportingPortal } from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { isClubUser } from "@/lib/roles";

export function EventsReportingForm() {
  const { month, year } = getActiveReportPeriod();

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const { data: window } = useReportingWindow(month, year);
  const { data } = useEventsReportingPortal(month, year);

  const clubId = session?.user?.clubId ?? data?.clubId ?? null;
  const clubName = data?.clubName ?? session?.user?.name ?? "Your club";
  const reportingClosed = clubUser && window && !window.open;
  const periodLabel = getReportingPeriodLabel(month, year);
  const hasClubEvents = (data?.clubEvents.length ?? 0) > 0;
  const eventsSubmitted = data?.report?.status === "SUBMITTED" || hasClubEvents;

  return (
    <ReportingFormLayout
      title="Events Reporting"
      subtitle={
        clubUser
          ? `Add and view ${clubName} events for ${periodLabel}.`
          : `Plan, track, and report club events for ${periodLabel}.`
      }
      banner={<ReportingWindowBanner month={month} year={year} />}
      className="max-w-6xl"
    >
      <Button variant="ghost" size="sm" className="-mt-2 mb-2 w-fit px-0 text-muted-foreground" asChild>
        <Link href="/dashboard/reporting">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Monthly Reporting
        </Link>
      </Button>

      {clubUser && !clubId && (
        <p className="text-sm text-destructive">
          Your account is not linked to a club. Contact the district secretary to add events.
        </p>
      )}

      {clubUser && eventsSubmitted && (
        <div className="depth-card mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium text-foreground">Events reporting complete</p>
            <p className="text-sm text-muted-foreground">
              You can keep adding club events for {periodLabel}. Reporting stays complete once at
              least one event is on record.
            </p>
          </div>
        </div>
      )}

      <EventsBrowsingView
        month={month}
        year={year}
        clubId={clubId}
        ownClubId={clubUser ? clubId : undefined}
        clubName={clubName}
        showAddEvent={clubUser && !!clubId && !reportingClosed}
        districtSectionTitle="District Events"
        clubSectionTitle={clubUser ? "Your Club Events" : "Club Events"}
      />

      <p className="text-sm text-muted-foreground">
        {clubUser
          ? `Add at least one club event for ${periodLabel} to complete events reporting. District event participation details belong under `
          : "District event participation details belong under "}
        <Link href="/dashboard/reporting/admin" className="text-accent hover:underline">
          Admin Reporting
        </Link>
        .
      </p>

      {clubUser && clubId && reportingClosed && (
        <p className="text-sm text-destructive">{window?.message}</p>
      )}
    </ReportingFormLayout>
  );
}
