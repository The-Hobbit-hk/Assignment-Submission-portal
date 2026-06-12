"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportingStatusBadge } from "@/components/reporting/reporting-status-badge";
import { useClubReports } from "@/hooks/use-reporting-window";
import { canViewAllClubReports } from "@/lib/roles";
import {
  getActiveReportPeriod,
  getReportingPeriodLabel,
  getSubmissionWindowLabel,
} from "@/lib/reporting";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import type { UserRole } from "@/types/auth";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="depth-card rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

export function ClubReportsView() {
  const active = getActiveReportPeriod();
  const [month, setMonth] = useState(active.month);
  const [year, setYear] = useState(active.year);
  const [zone, setZone] = useState("");

  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const districtView = canViewAllClubReports(role);

  const { data, isLoading, isError } = useClubReports(month, year, zone || undefined);

  const periodLabel = getReportingPeriodLabel(month, year);
  const windowLabel = getSubmissionWindowLabel(month, year);
  const clubs = data?.clubs ?? [];
  const summary = data?.summary;
  const exportParams = new URLSearchParams({ month: String(month), year: String(year) });
  if (zone) exportParams.set("zone", zone);

  const zoneOptions = useMemo(
    () => DISTRICT_ZONE_META.map((z) => z.zone),
    []
  );

  const title = districtView ? "Club Reporting Overview" : "Zone Reporting Overview";
  const subtitle = districtView
    ? `Report period: ${periodLabel}. Clubs submit during ${windowLabel.openLabel} – ${windowLabel.closeLabel}. A club is complete only when both admin and events reports are submitted.`
    : `Report period: ${periodLabel}. Track completion for clubs in your zone(s).`;

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to this reporting overview.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={title}
        subtitle={subtitle}
        action={
          districtView ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-accent text-accent-foreground" asChild>
                <a href={`/api/reporting/export/club-reports?${exportParams}`} download>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download Excel</span>
                  <span className="sm:hidden">Excel</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/reporting/export/admin?${exportParams}`} download>
                  Admin only
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/reporting/export/events?${exportParams}`} download>
                  Events only
                </a>
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Report period</span>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        {districtView && (
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Zone</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">All zones</option>
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
        )}
        {!districtView && data?.zones && data.zones.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Your zone(s): <span className="font-medium text-foreground">{data.zones.join(", ")}</span>
          </p>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard label="Total clubs" value={summary.total} />
              <SummaryCard label="Fully complete" value={summary.completed} accent="text-green-600" />
              <SummaryCard label="Incomplete" value={summary.incomplete} accent="text-destructive" />
              <SummaryCard label="Admin submitted" value={summary.adminSubmitted} />
              <SummaryCard label="Events submitted" value={summary.eventsSubmitted} />
            </div>
          )}

          <div className="table-scroll rounded-lg border border-border/40">
            <Table className="ref-table min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Club</TableHead>
                  {districtView && <TableHead>Zone</TableHead>}
                  <TableHead>Admin Reporting</TableHead>
                  <TableHead>Events Reporting</TableHead>
                  <TableHead>Monthly Complete</TableHead>
                  <TableHead className="hidden lg:table-cell">Admin submitted</TableHead>
                  <TableHead className="hidden lg:table-cell">Events submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={districtView ? 7 : 6} className="text-center text-muted-foreground">
                      No clubs found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  clubs.map((row) => (
                    <TableRow key={row.club.id}>
                      <TableCell className="font-medium">{row.club.name}</TableCell>
                      {districtView && (
                        <TableCell className="text-muted-foreground">{row.club.zone ?? "—"}</TableCell>
                      )}
                      <TableCell>
                        <ReportingStatusBadge status={row.adminStatus} />
                      </TableCell>
                      <TableCell>
                        <ReportingStatusBadge status={row.eventsStatus} />
                      </TableCell>
                      <TableCell>
                        {row.completed ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                            <XCircle className="h-4 w-4" />
                            Incomplete
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {row.admin?.submittedAt
                          ? new Date(row.admin.submittedAt).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {row.events?.submittedAt
                          ? new Date(row.events.submittedAt).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
