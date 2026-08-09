"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client";
import type { MonthlyReportingOverview } from "@/lib/monthly-reporting-overview";
import { getActiveReportPeriod } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";
import { cn } from "@/lib/utils";

const AVENUE_BAR_COLORS = [
  "bg-accent",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-cyan-500",
];

function StatCard({
  label,
  value,
  hint,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="depth-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", accent ?? "text-foreground")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  colorClass,
  trailing,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  trailing?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-medium text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {trailing ?? value}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="depth-card space-y-4 rounded-2xl p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function MonthlyReportingDashboard() {
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reporting", "monthly-overview", month, year],
    queryFn: () =>
      apiJson<MonthlyReportingOverview>(
        `/api/reporting/monthly-overview?month=${month}&year=${year}`
      ),
  });

  const exportParams = useMemo(() => {
    const p = new URLSearchParams({ month: String(month), year: String(year) });
    return p.toString();
  }, [month, year]);

  const maxZoneEvents = Math.max(1, ...(data?.zones.map((z) => z.eventCount) ?? [1]));
  const maxAvenue = Math.max(1, ...(data?.avenues.map((a) => a.count) ?? [1]));
  const maxNewMembersZone = Math.max(1, ...(data?.zones.map((z) => z.newMembers) ?? [1]));
  const maxClubMembers = Math.max(
    1,
    ...(data?.topNewMemberClubs.map((c) => c.newMembers) ?? [1])
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Monthly Reporting Dashboard"
        subtitle="Live district view of completion, membership growth, dues, and avenue-wise events. Admin only."
        action={
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/reporting/export/monthly-overview?${exportParams}`} download>
              <Download className="h-4 w-4" />
              Download PPT
            </a>
          </Button>
        }
      />

      <label className="inline-flex flex-col space-y-1 text-sm">
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

      {isLoading ? (
        <Skeleton className="h-[32rem] rounded-2xl" />
      ) : isError || !data ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Could not load the reporting dashboard for this period.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <StatCard
              label="Active clubs"
              value={data.summary.totalClubs}
              hint={`${data.summary.completedClubs} fully complete`}
            />
            <StatCard
              label="Fully complete"
              value={data.summary.completedClubs}
              accent="text-green-600"
              hint={`${data.summary.incompleteClubs} incomplete`}
              icon={CheckCircle2}
            />
            <StatCard
              label="New members"
              value={data.summary.newMembers}
              hint="From admin reporting"
              icon={Users}
              accent="text-accent"
            />
            <StatCard
              label="Events in period"
              value={data.summary.totalEvents}
              hint={`${data.summary.eventsSubmitted} clubs submitted events`}
              icon={CalendarDays}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Admin submitted"
              value={`${data.summary.adminSubmitted}/${data.summary.totalClubs}`}
            />
            <StatCard
              label="Events submitted"
              value={`${data.summary.eventsSubmitted}/${data.summary.totalClubs}`}
            />
            <StatCard
              label="Dues paid clubs"
              value={`${data.summary.duesPaidClubs}/${data.summary.totalClubs}`}
              hint={`${data.summary.duesMembers} members covered`}
              icon={Wallet}
            />
            <StatCard
              label="Governance yes"
              value={`${data.summary.resolutionYes} / ${data.summary.bylawsYes} / ${data.summary.budgetYes}`}
              hint="Resolution · Bylaws · Budget"
            />
          </div>

          {data.perfectZones.length > 0 && (
            <div className="depth-card flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <Award className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-foreground">100% complete zones:</span>
              {data.perfectZones.map((z) => (
                <Badge key={z} className="bg-emerald-600 text-white hover:bg-emerald-600">
                  {z}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Zone-wise completion"
              subtitle="Share of active clubs that submitted both admin and events reports"
            >
              <div className="space-y-4">
                {data.zones.map((zone) => (
                  <HorizontalBar
                    key={zone.zone}
                    label={zone.zone}
                    value={zone.completed}
                    max={Math.max(zone.total, 1)}
                    colorClass={zone.pct === 100 ? "bg-emerald-500" : "bg-accent"}
                    trailing={`${zone.completed}/${zone.total} · ${zone.pct}%`}
                  />
                ))}
              </div>
            </Section>

            <Section
              title="Zone-wise events"
              subtitle="Events logged by clubs in this report period"
            >
              <div className="space-y-4">
                {data.zones.map((zone) => (
                  <HorizontalBar
                    key={zone.zone}
                    label={zone.zone}
                    value={zone.eventCount}
                    max={maxZoneEvents}
                    colorClass="bg-sky-500"
                    trailing={`${zone.eventCount} events`}
                  />
                ))}
              </div>
            </Section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Avenue-wise events"
              subtitle="Breakdown of club events by avenue / type"
            >
              {data.avenues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events recorded for this period.</p>
              ) : (
                <div className="space-y-4">
                  {data.avenues.map((avenue, i) => (
                    <HorizontalBar
                      key={avenue.type}
                      label={avenue.label}
                      value={avenue.count}
                      max={maxAvenue}
                      colorClass={AVENUE_BAR_COLORS[i % AVENUE_BAR_COLORS.length]}
                      trailing={`${avenue.count}`}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="New members by zone"
              subtitle="Members added as reported in Admin Reporting"
            >
              <div className="space-y-4">
                {data.zones.map((zone) => (
                  <HorizontalBar
                    key={zone.zone}
                    label={zone.zone}
                    value={zone.newMembers}
                    max={maxNewMembersZone}
                    colorClass="bg-violet-500"
                    trailing={`${zone.newMembers}`}
                  />
                ))}
              </div>
            </Section>
          </div>

          <Section
            title="Zone detail"
            subtitle="Admin vs events submissions, dues, membership, and events per zone"
          >
            <div className="table-scroll rounded-lg border border-border/40">
              <Table className="ref-table min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Clubs</TableHead>
                    <TableHead>Complete</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>New members</TableHead>
                    <TableHead>Dues paid</TableHead>
                    <TableHead>Dues members</TableHead>
                    <TableHead>Events #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.zones.map((zone) => (
                    <TableRow key={zone.zone}>
                      <TableCell className="font-medium">{zone.zone}</TableCell>
                      <TableCell>{zone.total}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium",
                            zone.pct === 100
                              ? "text-green-600"
                              : zone.pct === 0
                                ? "text-muted-foreground"
                                : "text-amber-600"
                          )}
                        >
                          {zone.completed}/{zone.total} ({zone.pct}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        {zone.adminSubmitted}/{zone.total}
                      </TableCell>
                      <TableCell>
                        {zone.eventsSubmitted}/{zone.total}
                      </TableCell>
                      <TableCell className="tabular-nums">{zone.newMembers}</TableCell>
                      <TableCell>
                        {zone.duesPaidClubs}/{zone.total}
                      </TableCell>
                      <TableCell className="tabular-nums">{zone.duesMembers}</TableCell>
                      <TableCell className="tabular-nums">{zone.eventCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Top clubs — new members"
              subtitle="Highest membership growth reported this month"
            >
              {data.topNewMemberClubs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clubs reported new members for this period.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.topNewMemberClubs.map((club) => (
                    <HorizontalBar
                      key={club.clubId}
                      label={`${club.name}${club.zone ? ` · ${club.zone}` : ""}`}
                      value={club.newMembers}
                      max={maxClubMembers}
                      colorClass="bg-accent"
                      trailing={`+${club.newMembers}`}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Completed clubs by zone"
              subtitle="Clubs that finished both Admin and Events reporting"
            >
              <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
                {data.zones.map((zone) => (
                  <div key={zone.zone}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{zone.zone}</p>
                      <span className="text-xs text-muted-foreground">
                        {zone.completedClubs.length}/{zone.total}
                      </span>
                    </div>
                    {zone.completedClubs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None complete yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {zone.completedClubs.map((club) => (
                          <li
                            key={club.name}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                            <span className="truncate text-foreground">{club.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
