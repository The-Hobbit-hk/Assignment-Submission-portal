"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { ReportingStatusBadge } from "@/components/reporting/reporting-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminSubmissions } from "@/hooks/use-reporting-window";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="depth-card rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function YesNoCell({ value }: { value: string | null }) {
  if (value === "yes") return <span className="text-sm font-medium text-green-600">Yes</span>;
  if (value === "no") return <span className="text-sm font-medium text-destructive">No</span>;
  return <span className="text-sm text-muted-foreground">—</span>;
}

function ProofLink({ href }: { href: string | null }) {
  if (!href) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
    >
      View
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export function AdminSubmissionsView() {
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
  const [zone, setZone] = useState("");

  const { data, isLoading, isError } = useAdminSubmissions(month, year, zone || undefined);

  const periodLabel = getReportingPeriodLabel(month, year);
  const clubs = data?.clubs ?? [];
  const summary = data?.summary;
  const exportParams = new URLSearchParams({ month: String(month), year: String(year) });

  const zoneOptions = useMemo(() => DISTRICT_ZONE_META.map((z) => z.zone), []);

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to Admin Reporting submissions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Admin Submissions"
        subtitle={`Club Admin Reporting answers for ${periodLabel}. Includes resolution, district dues, bylaws, master budget, and proof documents.`}
        action={
          <Button size="sm" className="bg-accent text-accent-foreground" asChild>
            <a href={`/api/reporting/export/admin?${exportParams}`} download>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Excel</span>
              <span className="sm:hidden">Excel</span>
            </a>
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Report period</span>
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
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              <SummaryCard label="Total clubs" value={summary.totalClubs} />
              <SummaryCard label="Submitted" value={summary.submitted} accent="text-green-600" />
              <SummaryCard label="Draft" value={summary.draft} accent="text-amber-600" />
              <SummaryCard
                label="Not submitted"
                value={summary.notSubmitted}
                accent="text-destructive"
              />
              <SummaryCard label="Resolution yes" value={summary.resolutionYes} />
              <SummaryCard label="Dues yes" value={summary.duesYes} />
              <SummaryCard label="Bylaws yes" value={summary.bylawsYes} />
              <SummaryCard label="Budget yes" value={summary.budgetYes} />
            </div>
          )}

          <div className="table-scroll rounded-lg border border-border/40">
            <Table className="ref-table min-w-[1280px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Club</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">New members</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Res. proof</TableHead>
                  <TableHead>Dues</TableHead>
                  <TableHead className="text-right">Dues members</TableHead>
                  <TableHead className="text-right">Dues amount</TableHead>
                  <TableHead>Dues proof</TableHead>
                  <TableHead>Bylaws</TableHead>
                  <TableHead>Bylaws proof</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Budget proof</TableHead>
                  <TableHead>Host club</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center text-muted-foreground">
                      No clubs found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  clubs.map((row) => (
                    <TableRow key={row.club.id}>
                      <TableCell className="font-medium">{row.club.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.club.zone ?? "—"}</TableCell>
                      <TableCell>
                        <ReportingStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.newMembers != null ? row.newMembers : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <YesNoCell value={row.resolutionPassed} />
                          {row.resolutionPassDate && (
                            <p className="text-xs text-muted-foreground">{row.resolutionPassDate}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProofLink href={row.resolutionFileUrl} />
                      </TableCell>
                      <TableCell>
                        <YesNoCell value={row.districtDuesPaid} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.districtDuesPaid === "yes" && row.districtDuesMembersCount != null
                          ? row.districtDuesMembersCount
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.districtDuesPaid === "yes" && row.districtDuesAmount != null
                          ? inr.format(row.districtDuesAmount)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <ProofLink href={row.districtDuesFileUrl} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <YesNoCell value={row.bylawsPassed} />
                          {row.bylawsPassDate && (
                            <p className="text-xs text-muted-foreground">{row.bylawsPassDate}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProofLink href={row.bylawsFileUrl} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <YesNoCell value={row.masterBudgetPassed} />
                          {row.masterBudgetPassDate && (
                            <p className="text-xs text-muted-foreground">
                              {row.masterBudgetPassDate}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProofLink href={row.masterBudgetFileUrl} />
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">
                        {row.hostClub?.trim() || "—"}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm">
                        {row.districtEventAttendance?.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleDateString("en-IN")
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
