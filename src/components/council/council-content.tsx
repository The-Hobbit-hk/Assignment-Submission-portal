"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PodiumCard } from "@/components/council/podium-card";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search, Trophy, Users } from "lucide-react";
import { useCouncilData } from "@/hooks/use-council";
import { cn } from "@/lib/utils";
import { getReportingPeriodLabel } from "@/lib/reporting";

function memberInitials(name: string) {
  return name
    .replace(/^(Rtr\.|PHF\.|DRR\.|PDRR\.)\s*/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-muted-foreground">—</span>;

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

function PeriodToggle({
  value,
  onChange,
}: {
  value: "monthly" | "yearly";
  onChange: (v: "monthly" | "yearly") => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border/60 bg-muted/30 p-1">
      {(["monthly", "yearly"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition",
            value === option
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function CouncilContent() {
  const now = new Date();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, isLoading } = useCouncilData({
    entityType: "MEMBER",
    month,
    year,
    period,
    search: search || undefined,
    page,
    limit: rowsPerPage,
  });

  const podium = data?.podium;
  const leaderboard = data?.leaderboard;
  const total = leaderboard?.pagination.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);

  const podiumSlots = useMemo(() => {
    if (!podium?.length) return [];
    const byRank = Object.fromEntries(podium.map((e) => [e.rank, e]));
    return [
      { entry: byRank[2], featured: false },
      { entry: byRank[1], featured: true },
      { entry: byRank[3], featured: false },
    ].filter((slot) => slot.entry);
  }, [podium]);

  const periodLabel =
    period === "yearly" ? `RIY ${year - 1}-${String(year).slice(-2)}` : getReportingPeriodLabel(month, year);

  const topScore = podium?.[0]?.score ?? 0;

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-sm">
              <Trophy className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Council leaderboard
              </p>
              <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                Council Live Scores
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Blue Book points for council members · {periodLabel}
              </p>
            </div>
          </div>
          <PeriodToggle
            value={period}
            onChange={(v) => {
              setPeriod(v);
              setPage(1);
            }}
          />
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ranked members
            </p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
              <Users className="h-5 w-5 text-accent" aria-hidden />
              {isLoading ? "—" : total}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Top score
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {isLoading ? "—" : topScore}
              <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              View
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-foreground">{period}</p>
            <p className="text-xs text-muted-foreground">Updates after Blue Book reviews</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={cn("rounded-2xl", i === 2 ? "h-56" : "h-48")} />
          ))}
        </div>
      ) : podiumSlots.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          {podiumSlots.map(({ entry, featured }) =>
            entry ? (
              <PodiumCard
                key={entry.id}
                rank={entry.rank ?? 0}
                name={entry.name}
                score={entry.score}
                clubName={entry.clubName}
                trendDirection={entry.trendDirection}
                featured={featured}
              />
            ) : null
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden />
          <p className="font-medium text-foreground">No scores yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Rankings appear once council Blue Book tasks are reviewed and points are allocated.
          </p>
        </div>
      )}

      <div className="dashboard-panel">
        <div className="dashboard-panel-header flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Full standings
            </p>
            <p className="text-sm font-semibold text-foreground">Live score table</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search by name..."
              className="border-border/60 bg-card pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : leaderboard?.data.length ? (
            <div className="table-scroll overflow-x-auto rounded-xl border border-border/40">
              <Table className="ref-table min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="hidden sm:table-cell">Club</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.data.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={cn(
                        "border-border/30 transition-colors hover:bg-muted/20",
                        entry.rank != null &&
                          entry.rank <= 3 &&
                          "bg-gradient-to-r from-accent/[0.03] to-transparent"
                      )}
                    >
                      <TableCell>
                        <RankBadge rank={entry.rank} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/40">
                            <AvatarFallback className="bg-accent/10 text-xs font-semibold text-accent">
                              {memberInitials(entry.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {entry.name.match(/^(Rtr\.|PHF\.)/i)
                              ? entry.name
                              : `Rtr. ${entry.name}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate text-muted-foreground sm:table-cell">
                        {entry.clubName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex min-w-[3rem] justify-center rounded-lg bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent">
                          {entry.score}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                        {entry.email ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
              No members match your search.
            </div>
          )}

          {leaderboard && total > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(v) => {
                    setRowsPerPage(parseInt(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-16 border-border/60 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <span>
                  {start}–{end} of {total}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= (leaderboard.pagination.totalPages || 1)}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
