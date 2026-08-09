"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  History,
  XCircle,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportingStatusBadge } from "@/components/reporting/reporting-status-badge";
import { apiJson } from "@/lib/api-client";
import type { ReportSubmissionLabel, SerializedMonthlyReport } from "@/lib/reporting";
import { getCurrentRotaryYear, getRotaryYearLabel } from "@/lib/rotary-year";
import { cn } from "@/lib/utils";

type HistoryMonth = {
  month: number;
  year: number;
  periodLabel: string;
  rotaryYearLabel: string;
  adminStatus: ReportSubmissionLabel;
  eventsStatus: ReportSubmissionLabel;
  completed: boolean;
  eventCount: number;
  admin: SerializedMonthlyReport | null;
  events: SerializedMonthlyReport | null;
};

type HistoryResponse = {
  club: { id: string; name: string } | null;
  rotaryYearLabel: string;
  rotaryYearStart: number;
  months: HistoryMonth[];
};

function yesNo(value: string | null | undefined) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "—";
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function MonthCard({ row }: { row: HistoryMonth }) {
  const [open, setOpen] = useState(false);
  const admin = row.admin;

  return (
    <div className="depth-card overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/40 sm:items-center"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{row.periodLabel}</p>
            {row.completed ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                Incomplete
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              Admin <ReportingStatusBadge status={row.adminStatus} />
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              Events <ReportingStatusBadge status={row.eventsStatus} />
            </span>
            <span className="text-xs text-muted-foreground">
              {row.eventCount} event{row.eventCount === 1 ? "" : "s"}
              {row.events?.noEventsDeclared ? " · No events declared" : ""}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/40 bg-muted/20 px-4 py-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin reporting
            </p>
            {admin ? (
              <div>
                <DetailRow
                  label="Submitted"
                  value={
                    admin.submittedAt
                      ? new Date(admin.submittedAt).toLocaleString("en-IN")
                      : admin.status === "DRAFT"
                        ? "Draft (not submitted)"
                        : "—"
                  }
                />
                <DetailRow label="New members" value={admin.newMembers ?? 0} />
                <DetailRow label="Resolution passed" value={yesNo(admin.resolutionPassed)} />
                <DetailRow label="District dues paid" value={yesNo(admin.districtDuesPaid)} />
                <DetailRow
                  label="Dues members / amount"
                  value={
                    admin.districtDuesPaid === "yes"
                      ? `${admin.districtDuesMembersCount ?? "—"} · ₹${admin.districtDuesAmount ?? "—"}`
                      : "—"
                  }
                />
                <DetailRow label="Bylaws passed" value={yesNo(admin.bylawsPassed)} />
                <DetailRow label="Master budget passed" value={yesNo(admin.masterBudgetPassed)} />
                <DetailRow label="Host club" value={yesNo(admin.hostClub)} />
                {admin.districtEventAttendance && (
                  <DetailRow
                    label="District event attendance"
                    value={admin.districtEventAttendance}
                  />
                )}
                <div className="flex flex-wrap gap-3 pt-2 text-xs">
                  {admin.resolutionFileUrl && (
                    <a
                      href={admin.resolutionFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Resolution file
                    </a>
                  )}
                  {admin.districtDuesFileUrl && (
                    <a
                      href={admin.districtDuesFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Dues proof
                    </a>
                  )}
                  {admin.bylawsFileUrl && (
                    <a
                      href={admin.bylawsFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Bylaws file
                    </a>
                  )}
                  {admin.masterBudgetFileUrl && (
                    <a
                      href={admin.masterBudgetFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Budget file
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No admin report on file for this month.</p>
            )}
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Events reporting
            </p>
            {row.events ? (
              <div>
                <DetailRow
                  label="Submitted"
                  value={
                    row.events.submittedAt
                      ? new Date(row.events.submittedAt).toLocaleString("en-IN")
                      : row.events.status === "DRAFT"
                        ? "Draft (not submitted)"
                        : "—"
                  }
                />
                <DetailRow
                  label="No events declared"
                  value={row.events.noEventsDeclared ? "Yes" : "No"}
                />
                <DetailRow label="Events logged" value={row.eventCount} />
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  No events report on file for this month.
                </p>
                <DetailRow label="Events logged" value={row.eventCount} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportingHistoryView() {
  const { data: session } = useSession();
  const currentRy = getCurrentRotaryYear();
  const [rotaryYearStart, setRotaryYearStart] = useState(currentRy.startYear);

  const yearOptions = [currentRy.startYear, currentRy.startYear - 1];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reporting", "history", rotaryYearStart, session?.user?.clubId],
    queryFn: () =>
      apiJson<HistoryResponse>(
        `/api/reporting/history?rotaryYear=${rotaryYearStart}`
      ),
    enabled: Boolean(session?.user),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit px-2 text-muted-foreground" asChild>
        <Link href="/dashboard/reporting">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Monthly Reporting
        </Link>
      </Button>

      <PageHeading
        title="Reporting History"
        subtitle={
          data?.club
            ? `Verify past admin and events submissions for ${data.club.name}.`
            : "Verify past admin and events submissions for your club."
        }
      />

      <label className="inline-flex flex-col space-y-1 text-sm">
        <span className="text-muted-foreground">Rotary year</span>
        <select
          value={rotaryYearStart}
          onChange={(e) => setRotaryYearStart(Number(e.target.value))}
          className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {getRotaryYearLabel(y)}
            </option>
          ))}
        </select>
      </label>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : isError || !data ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Could not load reporting history.
        </div>
      ) : data.months.length === 0 ? (
        <div className="depth-card flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
          <History className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No reporting periods yet for {data.rotaryYearLabel}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.months.map((row) => (
            <MonthCard key={`${row.year}-${row.month}`} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
