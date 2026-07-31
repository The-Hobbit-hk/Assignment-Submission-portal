"use client";

import { useState } from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDistrictDues } from "@/hooks/use-reporting-window";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";
import { CheckCircle2, Clock, Download, ExternalLink, XCircle } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="depth-card rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function DuesStatus({ paid }: { paid: string | null }) {
  if (paid === "yes") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        Paid
      </span>
    );
  }
  if (paid === "no") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
        <XCircle className="h-4 w-4" />
        Not paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <Clock className="h-4 w-4" />
      Pending
    </span>
  );
}

export function DistrictDuesView() {
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

  const { data, isLoading, isError } = useDistrictDues(month, year);

  const periodLabel = getReportingPeriodLabel(month, year);
  const clubs = data?.clubs ?? [];
  const summary = data?.summary;
  const exportParams = new URLSearchParams({ month: String(month), year: String(year) });

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to the District Dues overview.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="District Dues"
        subtitle={`Finance reporting submitted by clubs for ${periodLabel}. Shows district dues payment, members covered, amount paid, and proof.`}
        action={
          <Button size="sm" className="bg-accent text-accent-foreground" asChild>
            <a href={`/api/reporting/export/district-dues?${exportParams}`} download>
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
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Clubs paid" value={`${summary.clubsPaid}/${summary.totalClubs}`} accent="text-green-600" />
              <SummaryCard label="Members covered" value={String(summary.totalMembers)} />
              <SummaryCard label="Total amount collected" value={inr.format(summary.totalAmount)} accent="text-accent" />
              <SummaryCard label="Pending / not paid" value={String(summary.clubsPending + summary.clubsUnpaid)} accent="text-destructive" />
            </div>
          )}

          <div className="table-scroll rounded-lg border border-border/40">
            <Table className="ref-table min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Club</TableHead>
                  <TableHead className="hidden md:table-cell">Zone</TableHead>
                  <TableHead>Dues Paid</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No clubs found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  clubs.map((row) => (
                    <TableRow key={row.club.id}>
                      <TableCell className="font-medium">{row.club.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {row.club.zone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <DuesStatus paid={row.districtDuesPaid} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.districtDuesPaid === "yes" && row.membersCount != null
                          ? row.membersCount
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.districtDuesPaid === "yes" && row.amount != null
                          ? inr.format(row.amount)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {row.fileUrl ? (
                          <a
                            href={row.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                          >
                            View
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
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
