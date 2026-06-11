"use client";

import { useState } from "react";
import { PageHeading, SectionLabel } from "@/components/layout/page-heading";
import { PodiumCard } from "@/components/council/podium-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCouncilData } from "@/hooks/use-council";

export function CouncilContent() {
  const now = new Date();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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

  return (
    <div className="space-y-8">
      <PageHeading title="Council Live Scores" />

      <div className="flex flex-wrap gap-3">
        <Select
          value={period}
          onValueChange={(v) => {
            setPeriod(v as "monthly" | "yearly");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 border-border/60 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {podium?.map((entry) => (
            <PodiumCard
              key={entry.id}
              rank={entry.rank ?? 0}
              name={entry.name}
              score={entry.score}
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <SectionLabel>Live Score Table</SectionLabel>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <Table className="ref-table">
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard?.data.map((entry) => (
                  <TableRow key={entry.id} className="border-border/30">
                    <TableCell className="text-foreground">{entry.rank}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      Rtr. {entry.name}
                    </TableCell>
                    <TableCell className="text-foreground">{entry.score}</TableCell>
                    <TableCell>{entry.email ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {leaderboard && total > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-muted-foreground">
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
                  {[5, 10, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span>
              {start}-{end} of {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page >= (leaderboard.pagination.totalPages || 1)}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
