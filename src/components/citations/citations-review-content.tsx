"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ClipboardList,
  Search,
} from "lucide-react";
import { CitationStatusBadge } from "@/components/citations/citation-status-badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitationAssignments } from "@/hooks/use-citations";
import {
  citationTitleSortKey,
  formatCitationTitle,
  type SerializedCitationAssignment,
} from "@/lib/citations-shared";
import { cn } from "@/lib/utils";

function QueueRow({ assignment }: { assignment: SerializedCitationAssignment }) {
  const title = formatCitationTitle(assignment.definition.title);
  const submitted = assignment.submittedAt
    ? new Date(assignment.submittedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Link
      href={`/dashboard/citations/review/${assignment.id}`}
      className={cn(
        "group grid gap-3 border-b border-border/40 px-4 py-3.5 transition-colors last:border-b-0",
        "hover:bg-accent/[0.04] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-5"
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground group-hover:text-accent">{title}</p>
          <CitationStatusBadge status={assignment.status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{assignment.club.name}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
        <span className="rounded-md bg-muted/60 px-2 py-1 font-medium text-foreground">
          {assignment.definition.points} pts
        </span>
        <span>{assignment.periodLabel}</span>
        {assignment.dueDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden />
            Due {new Date(assignment.dueDate).toLocaleDateString("en-IN")}
          </span>
        )}
        {submitted && <span>Submitted {submitted}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span className="text-sm font-medium text-accent group-hover:underline">Review</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </Link>
  );
}

export function CitationsReviewContent() {
  const { data: assignments, isLoading } = useCitationAssignments({ status: "SUBMITTED" });
  const [search, setSearch] = useState("");

  const queue = useMemo(() => {
    const list = [...(assignments ?? [])].sort((a, b) => {
      const clubCmp = a.club.name.localeCompare(b.club.name, "en", {
        sensitivity: "base",
      });
      if (clubCmp !== 0) return clubCmp;

      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;

      return (
        citationTitleSortKey(a.definition.title) - citationTitleSortKey(b.definition.title)
      );
    });

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => {
      const title = formatCitationTitle(a.definition.title).toLowerCase();
      return title.includes(q) || a.club.name.toLowerCase().includes(q);
    });
  }, [assignments, search]);

  const groupedQueue = useMemo(() => {
    const groups: {
      clubId: string;
      clubName: string;
      zone: string | null;
      assignments: SerializedCitationAssignment[];
    }[] = [];

    for (const assignment of queue) {
      const last = groups[groups.length - 1];
      if (last && last.clubId === assignment.clubId) {
        last.assignments.push(assignment);
      } else {
        groups.push({
          clubId: assignment.clubId,
          clubName: assignment.club.name,
          zone: assignment.club.zone,
          assignments: [assignment],
        });
      }
    }

    return groups;
  }, [queue]);

  const total = assignments?.length ?? 0;
  const uniqueClubs = useMemo(() => {
    if (!assignments?.length) return 0;
    return new Set(assignments.map((a) => a.clubId)).size;
  }, [assignments]);

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
              <ClipboardList className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                DRR review
              </p>
              <h1 className="font-display text-xl font-bold sm:text-2xl">Citation Review Queue</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Approve or reject club citation submissions
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <div className="rounded-xl border border-border/40 bg-card/70 px-4 py-3 backdrop-blur-sm sm:min-w-[8.5rem] sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pending
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {isLoading ? "—" : total}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/70 px-4 py-3 backdrop-blur-sm sm:min-w-[8.5rem] sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Clubs submitted
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {isLoading ? "—" : uniqueClubs}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : total === 0 ? (
        <div className="depth-card rounded-xl p-10 text-center text-muted-foreground">
          No submissions pending review.
        </div>
      ) : (
        <div className="dashboard-panel overflow-hidden rounded-2xl">
          <div className="dashboard-panel-header flex-col items-stretch gap-3 border-b border-border/40 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Queue
              </p>
              <p className="text-sm font-semibold text-foreground">
                {queue.length === total
                  ? `${total} awaiting review · grouped by club`
                  : `${queue.length} of ${total} shown · grouped by club`}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search club or citation…"
                className="border-border/60 bg-background pl-9"
              />
            </div>
          </div>

          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No submissions match your search.
            </p>
          ) : (
            <div>
              {groupedQueue.map((group) => (
                <section key={group.clubId}>
                  <div className="sticky top-0 z-[1] flex items-center justify-between gap-3 border-b border-border/40 bg-muted/50 px-4 py-2.5 backdrop-blur-sm sm:px-5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {group.clubName}
                        </p>
                        {group.zone && (
                          <p className="text-[11px] text-muted-foreground">{group.zone}</p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/50">
                      {group.assignments.length} citation
                      {group.assignments.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div>
                    {group.assignments.map((assignment) => (
                      <QueueRow key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/dashboard/citations" className="text-accent hover:underline">
          Back to manage citations
        </Link>
      </p>
    </div>
  );
}
