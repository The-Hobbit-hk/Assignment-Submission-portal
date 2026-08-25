"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDistrictDues,
  useDistrictDuesPaidMembers,
} from "@/hooks/use-reporting-window";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Download, ExternalLink, Search, XCircle } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type TabId = "reports" | "members";

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

function ClubReportsPanel() {
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
      <div className="flex flex-wrap items-end justify-between gap-3">
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
        <Button size="sm" className="bg-accent text-accent-foreground" asChild>
          <a href={`/api/reporting/export/district-dues?${exportParams}`} download>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Excel</span>
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Club Admin Reporting for {periodLabel}: payment status, members covered, amount, and proof.
      </p>

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

function PaidMembersPanel() {
  const { data, isLoading, isError } = useDistrictDuesPaidMembers();
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("all");

  const clubs = data?.clubs ?? [];
  const summary = data?.summary;

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const group of clubs) {
      if (group.club.zone) set.add(group.club.zone);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [clubs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs
      .filter((group) => zone === "all" || group.club.zone === zone)
      .map((group) => {
        if (!q) return group;
        const clubHit = group.club.name.toLowerCase().includes(q);
        const members = clubHit
          ? group.members
          : group.members.filter((member) => {
              const haystack = [
                member.firstName,
                member.lastName,
                member.email,
                member.riId ?? "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(q);
            });
        return { ...group, members, paidCount: members.length };
      })
      .filter((group) => group.members.length > 0);
  }, [clubs, query, zone]);

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to the paid members list.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Individual roster members marked as district dues paid. Clubs with no paid members yet are hidden.
      </p>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Clubs with paid members"
                value={String(summary.clubsWithPaidMembers)}
                accent="text-green-600"
              />
              <SummaryCard
                label="Members marked paid"
                value={String(summary.totalPaidMembers)}
              />
              <SummaryCard
                label="Total roster size"
                value={String(summary.totalRosterMembers)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <label className="relative min-w-[220px] flex-1 space-y-1 text-sm">
              <span className="text-muted-foreground">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Club, member name, email, or RI ID"
                  className="pl-9"
                />
              </span>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Zone</span>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
              >
                <option value="all">All zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
              No paid members found yet. Mark members via the dues list script, then refresh.
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((group) => (
                <section key={group.club.id} className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{group.club.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.club.zone ?? "Unassigned zone"}
                        {group.club.charterNumber ? ` · Charter ${group.club.charterNumber}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-green-700">
                      {group.paidCount} paid
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        / {group.rosterCount} on roster
                      </span>
                    </p>
                  </div>

                  <div className="table-scroll rounded-lg border border-border/40">
                    <Table className="ref-table min-w-[640px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>RI ID</TableHead>
                          <TableHead className="hidden sm:table-cell">Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.members.map((member, index) => (
                          <TableRow key={member.id}>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {member.firstName} {member.lastName}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground md:table-cell">
                              {member.email}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {member.riId || "—"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {member.role}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Paid
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function DistrictDuesView() {
  const [tab, setTab] = useState<TabId>("members");

  return (
    <div className="space-y-6">
      <PageHeading
        title="District Dues"
        subtitle="Club finance reporting and the member-level paid roster verified by the district."
      />

      <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-1">
        {(
          [
            { id: "members", label: "Paid members" },
            { id: "reports", label: "Club reports" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition",
              tab === item.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "members" ? <PaidMembersPanel /> : <ClubReportsPanel />}
    </div>
  );
}
