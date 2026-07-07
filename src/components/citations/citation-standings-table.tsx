"use client";

import { useMemo, useState } from "react";
import type { CitationStandingsPeriodHint } from "@/hooks/use-citations";
import { Search, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitationStandings } from "@/hooks/use-citations";
import { siteConfig } from "@/config/site";
import type { CitationCadence } from "@/generated/prisma/client";
import { ROTARY_MONTH_ORDER, rotaryQuarterOfMonth } from "@/lib/rotary-year";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? "bg-amber-100 text-amber-800 ring-amber-300/50"
      : rank === 2
        ? "bg-slate-100 text-slate-700 ring-slate-300/50"
        : rank === 3
          ? "bg-orange-100 text-orange-900 ring-orange-300/50"
          : "bg-muted text-muted-foreground ring-border/50";

  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1",
        styles
      )}
    >
      {rank}
    </span>
  );
}

interface CitationStandingsTableProps {
  limit?: number;
  compact?: boolean;
}

export function CitationStandingsTable({ limit, compact }: CitationStandingsTableProps) {
  const now = new Date();
  const [cadence, setCadence] = useState<CitationCadence>("MONTHLY");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(rotaryQuarterOfMonth(now.getMonth() + 1));
  const [rotaryYear, setRotaryYear] = useState<string>(siteConfig.rotaryYear);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCitationStandings({
    cadence,
    year,
    month: cadence === "MONTHLY" ? month : undefined,
    quarter: cadence === "QUARTERLY" ? quarter : undefined,
    rotaryYearLabel: cadence === "YEARLY" ? rotaryYear : undefined,
    limit,
  });

  const filtered = useMemo(() => {
    const rows = data?.standings ?? [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.clubName.toLowerCase().includes(q) ||
        (r.zone?.toLowerCase().includes(q) ?? false)
    );
  }, [data?.standings, search]);

  const podium = filtered.slice(0, 3);
  const totalPointsInView = (data?.standings ?? []).reduce((sum, row) => sum + row.totalPoints, 0);

  const applyPeriodHint = (hint: CitationStandingsPeriodHint) => {
    setCadence(hint.cadence);
    setYear(hint.year);
    if (hint.month) setMonth(hint.month);
    if (hint.quarter) setQuarter(hint.quarter);
    if (hint.rotaryYearLabel) setRotaryYear(hint.rotaryYearLabel);
  };

  return (
    <div className="space-y-4">
      {!compact && (
        <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-sm">
                <Trophy className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  District citations
                </p>
                <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Citation Standings
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  All clubs ranked by approved citation points
                  {data?.periodLabel ? ` · ${data.periodLabel}` : ""}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border/60 bg-muted/30 p-1">
          {(["MONTHLY", "QUARTERLY", "YEARLY"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCadence(option)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
                cadence === option
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option === "MONTHLY" ? "Monthly" : option === "QUARTERLY" ? "Quarterly" : "Yearly"}
            </button>
          ))}
        </div>

        {cadence === "MONTHLY" && (
          <>
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v, 10))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROTARY_MONTH_ORDER.map((m) => (
                  <SelectItem key={m} value={String(m)}>{MONTHS[m - 1]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {cadence === "QUARTERLY" && (
          <>
            <Select value={String(quarter)} onValueChange={(v) => setQuarter(parseInt(v, 10))}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((q) => (
                  <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {cadence === "YEARLY" && (
          <Select value={rotaryYear} onValueChange={setRotaryYear}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={siteConfig.rotaryYear}>RIY {siteConfig.rotaryYear}</SelectItem>
            </SelectContent>
          </Select>
        )}

        {!compact && (
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {!compact && !isLoading && (data?.approvedPeriods?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {totalPointsInView === 0 && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              No approved points for <strong>{data?.periodLabel}</strong>. Approved citations
              may be under a different period or cadence — select one below.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {data!.approvedPeriods.map((hint) => {
              const active = hint.periodKey === data?.periodKey && hint.cadence === cadence;
              return (
                <button
                  key={`${hint.cadence}-${hint.periodKey}`}
                  type="button"
                  onClick={() => applyPeriodHint(hint)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border/60 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  {hint.periodLabel} · {hint.totalPoints} pts
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!compact && podium.length > 0 && !isLoading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {podium.map((entry) => (
            <div
              key={entry.clubId}
              className={cn(
                "depth-card rounded-xl p-4 text-center",
                entry.rank === 1 && "ring-2 ring-amber-400/40"
              )}
            >
              <RankBadge rank={entry.rank} />
              <p className="mt-2 truncate text-sm font-semibold">{entry.clubName}</p>
              <p className="text-2xl font-bold text-accent">{entry.totalPoints}</p>
              <p className="text-xs text-muted-foreground">citation pts</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="table-scroll rounded-xl border border-border/40 bg-card/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Club</TableHead>
                {!compact && <TableHead className="hidden sm:table-cell">Zone</TableHead>}
                <TableHead className="text-right">Points</TableHead>
                {!compact && <TableHead className="hidden md:table-cell text-right">Approved</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No standings for this period yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.clubId}>
                    <TableCell><RankBadge rank={row.rank} /></TableCell>
                    <TableCell className="font-medium">{row.clubName}</TableCell>
                    {!compact && <TableCell className="hidden sm:table-cell text-muted-foreground">{row.zone ?? "—"}</TableCell>}
                    <TableCell className="text-right font-semibold text-accent">{row.totalPoints}</TableCell>
                    {!compact && <TableCell className="hidden md:table-cell text-right text-muted-foreground">{row.approvedCount}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
