"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsBrowsingView } from "@/components/events/events-browsing-view";
import { ReportingFormLayout } from "@/components/reporting/reporting-form-layout";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";
import { useEventsReportingPortal, useSaveEventsReport } from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { canManageEvents, isClubUser } from "@/lib/roles";
import { formErrorMessage, toast } from "@/lib/toast";

function downloadEventsExcel(month: number, year: number, newsletterOnly = false) {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  if (newsletterOnly) params.set("newsletterOnly", "true");
  window.location.href = `/api/reporting/export/events-detail?${params}`;
}

export function EventsReportingForm() {
  const active = getActiveReportPeriod();
  const optionOpts = { long: true, withYear: true } as const;
  const monthOptions = withMonthOption(
    rotaryMonthOptions(getCurrentRotaryYear().startYear, optionOpts),
    active.month,
    active.year,
    optionOpts
  );
  const [period, setPeriod] = useState(() => `${active.month}-${active.year}`);
  const [month, year] = period.split("-").map(Number);

  const { data: session } = useSession();
  const role = session?.user?.role ?? "MEMBER";
  const clubUser = isClubUser(role);
  const canAddDistrictEvent = !clubUser && canManageEvents(role);
  const canExportDistrict =
    !clubUser &&
    (canManageEvents(role) ||
      role === "REPORTING_SECRETARY" ||
      role === "SUPER_ADMIN" ||
      role === "DISTRICT_ADMIN");
  const { data: window } = useReportingWindow(month, year);
  const { data, refetch } = useEventsReportingPortal(month, year);
  const saveEvents = useSaveEventsReport();

  const clubId = session?.user?.clubId ?? data?.clubId ?? null;
  const clubName = data?.clubName ?? session?.user?.name ?? "Your club";
  const reportingClosed = clubUser && window && !window.open;
  const periodLabel = getReportingPeriodLabel(month, year);
  const hasClubEvents = (data?.clubEvents.length ?? 0) > 0;
  const noEventsDeclared = data?.report?.noEventsDeclared ?? false;

  const [noEvents, setNoEvents] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setNoEvents(noEventsDeclared);
  }, [noEventsDeclared]);

  const showNoEventsOption =
    clubUser && !!clubId && !reportingClosed && !hasClubEvents;
  const declaredComplete = noEventsDeclared && !hasClubEvents;

  const handleNoEventsToggle = async (checked: boolean) => {
    setNoEvents(checked);
    setError("");
    try {
      await saveEvents.mutateAsync({
        month,
        year,
        submit: checked,
        noEventsDeclared: checked,
      });
      // Force a fresh portal read (Undo was previously undone by a cached GET).
      await refetch({ cancelRefetch: false });
    } catch (err) {
      setNoEvents(!checked);
      setError(formErrorMessage(err, "Failed to update events reporting."));
    }
  };

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
      <div className="-mt-2 mb-2 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground" asChild>
          <Link href="/dashboard/reporting">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Monthly Reporting
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {(clubUser || canExportDistrict) && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadEventsExcel(month, year, false);
                  toast.success("Downloading events Excel…");
                }}
              >
                <Download className="mr-1 h-4 w-4" />
                Download Excel
              </Button>
              {canExportDistrict && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadEventsExcel(month, year, true);
                    toast.success("Downloading newsletter events…");
                  }}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Newsletter Excel
                </Button>
              )}
            </>
          )}
          {canAddDistrictEvent && (
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="/dashboard/events/new">
                <Plus className="mr-1 h-4 w-4" />
                Add Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      {clubUser && !clubId && (
        <p className="text-sm text-destructive">
          Your account is not linked to a club. Contact the district secretary to add events.
        </p>
      )}

      {clubUser && declaredComplete && (
        <div className="depth-card mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="font-medium text-foreground">No events conducted this month</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve recorded that {clubName} held no events in {periodLabel}. Events reporting
              is marked complete.
            </p>
          </div>
          {!reportingClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNoEventsToggle(false)}
              disabled={saveEvents.isPending}
            >
              Undo
            </Button>
          )}
        </div>
      )}

      {showNoEventsOption && (
        <label className="mb-4 flex items-start gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={noEvents}
            disabled={saveEvents.isPending}
            onChange={(e) => handleNoEventsToggle(e.target.checked)}
          />
          <span>
            <span className="font-medium text-foreground">
              No events were conducted this month
            </span>
            <span className="mt-1 block text-muted-foreground">
              Check this if {clubName} held no events in {periodLabel}. Events reporting will be
              marked complete and you won&apos;t need to add an event.
            </span>
          </span>
        </label>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Report month</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <EventsBrowsingView
        month={month}
        year={year}
        clubId={clubId}
        ownClubId={clubUser ? clubId : undefined}
        clubName={clubName}
        showAddEvent={clubUser && !!clubId && !reportingClosed && !noEvents && !declaredComplete}
        showDistrictSection={false}
        clubSectionTitle={clubUser ? "Your Club Events" : "Club Events"}
      />

      <p className="text-sm text-muted-foreground">
        {clubUser
          ? `Add at least one club event for ${periodLabel} to complete events reporting. Use the newsletter toggle on an event if you want district to feature it later. Download Excel anytime for full event details.`
          : "Use Download Excel for all club events this month, or Newsletter Excel for events flagged for the district newsletter."}
      </p>

      {clubUser && clubId && reportingClosed && (
        <p className="text-sm text-destructive">{window?.message}</p>
      )}
    </ReportingFormLayout>
  );
}
