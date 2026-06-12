"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsBrowsingView } from "@/components/events/events-browsing-view";
import { ReportingFormLayout } from "@/components/reporting/reporting-form-layout";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { useEventsReportingPortal, useSaveEventsReport } from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { isClubUser } from "@/lib/roles";
import { toast } from "@/lib/toast";

export function EventsReportingForm() {
  const { month, year } = getActiveReportPeriod();

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const { data: window } = useReportingWindow(month, year);
  const { data, refetch } = useEventsReportingPortal(month, year);
  const saveEventsReport = useSaveEventsReport();

  const clubId = session?.user?.clubId ?? data?.clubId ?? null;
  const clubName = data?.clubName ?? session?.user?.name ?? "Your club";
  const reportingClosed = clubUser && window && !window.open;
  const eventsSubmitted = data?.report?.status === "SUBMITTED";

  const handleSubmitEventsReport = async () => {
    await saveEventsReport.mutateAsync({ month, year, submit: true });
    await refetch();
    toast.success("Events report submitted successfully");
  };

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
        . Monthly reporting is complete only after both events and admin reports are submitted.
      </p>

      {clubUser && clubId && (
        <div className="space-y-2 border-t border-border/40 pt-4">
          {reportingClosed && (
            <p className="text-sm text-destructive">{window?.message}</p>
          )}
          <Button
            onClick={handleSubmitEventsReport}
            disabled={saveEventsReport.isPending || reportingClosed || eventsSubmitted}
            className="bg-accent px-10 text-accent-foreground hover:bg-accent/90"
          >
            {saveEventsReport.isPending
              ? "Submitting..."
              : eventsSubmitted
                ? "Events report submitted"
                : "Submit events report"}
          </Button>
          {eventsSubmitted && (
            <p className="text-sm text-green-500">Events report submitted for this month.</p>
          )}
        </div>
      )}
    </ReportingFormLayout>
  );
}
