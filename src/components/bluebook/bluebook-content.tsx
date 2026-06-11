"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeading, SectionLabel } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useBluebookTasks } from "@/hooks/use-bluebook";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  maxScore: number;
  scored: number;
  dueDate: string;
  isExpired: boolean;
};

type Analytics = { totalAllocated: number };

export function BluebookContent() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(month);

  const { data, isLoading, refetch } = useBluebookTasks({
    month: filterMonth,
    year,
    summary: true,
  });

  const tasks = (data as { tasks?: TaskRow[] } | undefined)?.tasks;
  const analytics = (data as { analytics?: Analytics } | undefined)?.analytics;
  const monthLabel = `${MONTHS[filterMonth - 1]} ${year}`;

  return (
    <div className="space-y-4">
      <PageHeading
        title="Blue Book Tasks"
        action={
          <p className="text-sm text-muted-foreground">
            Score : <span className="font-semibold text-foreground">{analytics?.totalAllocated ?? 0}</span>
          </p>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-full border-border/60 bg-card sm:w-40">
            <SelectValue>{MONTHS[month - 1]} {year}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m} {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            setFilterMonth(month);
            refetch();
          }}
        >
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        <SectionLabel>My Tasks</SectionLabel>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="table-scroll rounded-lg border border-border/40 bg-card/50">
            <Table className="ref-table min-w-[640px]">
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="hidden sm:table-cell">Task ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Scored</TableHead>
                  <TableHead className="hidden md:table-cell">Due date</TableHead>
                  <TableHead className="hidden xl:table-cell">Requirement</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks?.length ? (
                  tasks.map((t) => (
                    <TableRow key={t.id} className="border-border/30">
                      <TableCell className="hidden sm:table-cell">
                        <Link href={`/dashboard/bluebook/${t.id}`} className="hover:text-accent">
                          {t.id.slice(-3)}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[140px] font-medium text-foreground">
                        <Link href={`/dashboard/bluebook/${t.id}`} className="hover:text-accent">
                          {t.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden max-w-[220px] truncate lg:table-cell">
                        {t.description ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lowercase md:table-cell">{t.category}</TableCell>
                      <TableCell>{t.maxScore}</TableCell>
                      <TableCell className="hidden sm:table-cell">{t.scored}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(t.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">Both</TableCell>
                      <TableCell>
                        <span className={t.isExpired ? "font-medium text-destructive" : "text-green-500"}>
                          {t.isExpired ? "Expired" : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      No tasks for {monthLabel}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
