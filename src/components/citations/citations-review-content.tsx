"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { CitationAssignmentCard } from "@/components/citations/citation-assignment-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitationAssignments } from "@/hooks/use-citations";

export function CitationsReviewContent() {
  const { data: assignments, isLoading } = useCitationAssignments({ status: "SUBMITTED" });

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              DRR review
            </p>
            <h1 className="font-display text-xl font-bold sm:text-2xl">Citation Review Queue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submissions awaiting DRR approval
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (assignments ?? []).length === 0 ? (
        <div className="depth-card rounded-xl p-10 text-center text-muted-foreground">
          No submissions pending review.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments!.map((assignment) => (
            <CitationAssignmentCard
              key={assignment.id}
              assignment={assignment}
              showClub
              href={`/dashboard/citations/review/${assignment.id}`}
            />
          ))}
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
