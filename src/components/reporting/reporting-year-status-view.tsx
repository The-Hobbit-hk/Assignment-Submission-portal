"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Minus, X } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useReportingYearStatus } from "@/hooks/use-reporting-window";
import { canViewAllClubReports } from "@/lib/roles";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import { getCurrentRotaryYear, getRotaryYearLabel } from "@/lib/rotary-year";
import { formatIstDate } from "@/lib/timezone";
import type { UserRole } from "@/types/auth";
import type { MonthCellStatus } from "@/lib/reporting-year-matrix";

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

function MonthMark({ status }: { status: MonthCellStatus }) {
  if (status === "COMPLETE") {
    return (
      <span
        title="Reporting complete"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === "MISSED") {
    return (
      <span
        title="Missed reporting"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive/15 text-destructive"
      >
        <X className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span
        title="Window open / not yet due"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border/70 text-muted-foreground"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      </span>
    );
  }
  return (
    <span
      title="Before club portal access"
      className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground/50"
    >
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

export function ReportingYearStatusView() {
  const current = getCurrentRotaryYear();
  const [startYear, setStartYear] = useState(current.startYear);
  const [zone, setZone] = useState("");
  const [filter, setFilter] = useState<"" | "perfect" | "missed" | "pending">("");

  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const districtView = canViewAllClubReports(role);

  const { data, isLoading, isError } = useReportingYearStatus(
    startYear,
    zone || undefined
  );

  const yearOptions = useMemo(() => {
    const years = new Set([current.startYear, current.startYear - 1, startYear]);
    return Array.from(years)
      .filter((y) => y >= 2025)
      .sort((a, b) => b - a);
  }, [current.startYear, startYear]);

  const zoneOptions = useMemo(() => DISTRICT_ZONE_META.map((z) => z.zone), []);

  const clubs = useMemo(() => {
    const rows = data?.clubs ?? [];
    if (!filter) return rows;
    if (filter === "perfect") {
      return rows.filter((r) => r.missed === 0 && r.completed > 0);
    }
    if (filter === "missed") return rows.filter((r) => r.missed > 0);
    return rows.filter((r) => r.pending > 0);
  }, [data?.clubs, filter]);

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to year reporting status.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Year Reporting Status"
        subtitle={`Active clubs · RIY ${getRotaryYearLabel(startYear)}. Tick = both admin + events submitted. Cross = missed after the 1–10 window. Months before a club’s first portal access are blank so late-access clubs can still hit 100% citation tracking.`}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Rotary year</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {getRotaryYearLabel(y)}
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
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Filter</span>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "" | "perfect" | "missed" | "pending")
            }
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">All clubs</option>
            <option value="perfect">100% complete (due months)</option>
            <option value="missed">Has misses</option>
            <option value="pending">Has pending</option>
          </select>
        </label>
        {!districtView && data?.zones && data.zones.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Your zone(s):{" "}
            <span className="font-medium text-foreground">{data.zones.join(", ")}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MonthMark status="COMPLETE" /> Complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MonthMark status="MISSED" /> Missed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MonthMark status="PENDING" /> Pending / open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MonthMark status="NA" /> Before access
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <>
          {data?.summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard label="Active clubs" value={data.summary.totalClubs} />
              <SummaryCard
                label="100% so far"
                value={data.summary.perfectClubs}
                accent="text-emerald-600"
              />
              <SummaryCard
                label="With misses"
                value={data.summary.clubsWithMisses}
                accent="text-destructive"
              />
              <SummaryCard
                label="No portal access"
                value={data.summary.clubsNotStarted}
                accent="text-muted-foreground"
              />
              <SummaryCard
                label="Avg citation %"
                value={
                  data.summary.avgCitationPct === null
                    ? "—"
                    : `${data.summary.avgCitationPct}%`
                }
              />
            </div>
          )}

          <div className="table-scroll rounded-lg border border-border/40">
            <table className="ref-table w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left">
                  <th className="sticky left-0 z-10 bg-muted/80 px-3 py-2.5 font-medium backdrop-blur">
                    Club
                  </th>
                  {districtView && (
                    <th className="px-2 py-2.5 font-medium text-muted-foreground">Zone</th>
                  )}
                  <th className="px-2 py-2.5 font-medium text-muted-foreground">From</th>
                  {(data?.months ?? []).map((m) => (
                    <th
                      key={m.key}
                      className="px-1.5 py-2.5 text-center text-xs font-medium text-muted-foreground"
                    >
                      {m.shortLabel}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-right font-medium">Done</th>
                  <th className="px-2 py-2.5 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {clubs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={(data?.months.length ?? 12) + (districtView ? 5 : 4)}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No clubs match this filter.
                    </td>
                  </tr>
                ) : (
                  clubs.map((row) => (
                    <tr
                      key={row.club.id}
                      className="border-b border-border/30 hover:bg-muted/20"
                    >
                      <td className="sticky left-0 z-10 bg-background/95 px-3 py-2 font-medium backdrop-blur">
                        {row.club.name}
                      </td>
                      {districtView && (
                        <td className="px-2 py-2 text-muted-foreground">
                          {row.club.zone ?? "—"}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-2 py-2 text-xs text-muted-foreground">
                        {row.firstAccessAt ? (
                          <span title={formatIstDate(new Date(row.firstAccessAt))}>
                            {row.firstReportMonth
                              ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][row.firstReportMonth.month - 1]} ${row.firstReportMonth.year}`
                              : "—"}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-normal">
                            No login
                          </Badge>
                        )}
                      </td>
                      {row.months.map((cell) => (
                        <td key={`${cell.month}-${cell.year}`} className="px-1.5 py-2 text-center">
                          <MonthMark status={cell.status} />
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {row.completed}/{row.completed + row.missed}
                        {row.pending > 0 ? (
                          <span className="text-muted-foreground/70"> (+{row.pending})</span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums font-medium">
                        {row.citationPct === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={
                              row.citationPct === 100
                                ? "text-emerald-600"
                                : row.missed > 0
                                  ? "text-destructive"
                                  : undefined
                            }
                          >
                            {row.citationPct}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
