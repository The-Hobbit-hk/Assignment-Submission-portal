"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsBrowsingView } from "@/components/events/events-browsing-view";
import { ReportingFormLayout } from "@/components/reporting/reporting-form-layout";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { getReportingPeriodLabel } from "@/lib/reporting";
import { useEventsReportingPortal } from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { isClubUser } from "@/lib/roles";

export function EventsReportingForm() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const { data: window } = useReportingWindow(month, year);
  const { data } = useEventsReportingPortal(month, year);

  const clubId = session?.user?.clubId ?? data?.clubId ?? null;
  const clubName = data?.clubName ?? session?.user?.name ?? "Your club";

  return (
    <ReportingFormLayout
      title="Events Reporting"
      subtitle={
        clubUser
          ? `Add and view ${clubName} events for ${getReportingPeriodLabel(month, year)}.`
          : `Plan, track, and report club events for ${getReportingPeriodLabel(month, year)}.`
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

      <EventsBrowsingView
        month={month}
        year={year}
        clubId={clubId}
        ownClubId={clubUser ? clubId : undefined}
        clubName={clubName}
        showAddEvent={clubUser && !!clubId}
        districtSectionTitle="District Events"
        clubSectionTitle={clubUser ? "Your Club Events" : "Club Events"}
      />

      <p className="text-sm text-muted-foreground">
        Complete district event participation under{" "}
        <Link href="/dashboard/reporting/admin" className="text-accent hover:underline">
          Admin Reporting
        </Link>
        .
      </p>

      {clubUser && window && !window.open && (
        <p className="text-sm text-muted-foreground">
          Reporting window is closed for monthly admin submission. You can still add and view club
          events here.
        </p>
      )}
    </ReportingFormLayout>
  );
}
