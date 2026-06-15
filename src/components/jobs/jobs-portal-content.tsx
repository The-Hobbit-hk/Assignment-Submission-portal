"use client";

import { useMemo, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { JobCard } from "@/components/jobs/job-card";
import { JobPostingForm } from "@/components/jobs/job-posting-form";
import { SectionLabel } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobPostings } from "@/hooks/use-jobs";
import { canManageJobs } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export function JobsPortalContent() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const canManage = canManageJobs(role, session?.user?.email);
  const { data: jobs, isLoading } = useJobPostings(canManage ? "ALL" : "OPEN");
  const [showForm, setShowForm] = useState(false);

  const openJobs = useMemo(
    () => (jobs ?? []).filter((job) => job.status === "OPEN"),
    [jobs]
  );
  const closedJobs = useMemo(
    () => (jobs ?? []).filter((job) => job.status === "CLOSED"),
    [jobs]
  );

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                District 3131
              </p>
              <h1 className="font-display text-xl font-bold sm:text-2xl">Job Portal</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {canManage
                  ? "Post opportunities for Rotaractors across the district."
                  : "Browse open roles and apply directly by email."}
              </p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setShowForm((value) => !value)}>
              {showForm ? "Hide form" : "Post job"}
            </Button>
          )}
        </div>
      </section>

      {canManage && showForm && (
        <div className="depth-card rounded-xl p-5">
          <SectionLabel className="mb-4">New job posting</SectionLabel>
          <JobPostingForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : openJobs.length === 0 && closedJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
          No job postings yet.
          {canManage ? " Use Post job to add the first opportunity." : ""}
        </div>
      ) : (
        <div className="space-y-8">
          {openJobs.length > 0 && (
            <section className="space-y-4">
              <SectionLabel>Open roles ({openJobs.length})</SectionLabel>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {openJobs.map((job) => (
                  <JobCard key={job.id} job={job} canManage={canManage} />
                ))}
              </div>
            </section>
          )}

          {canManage && closedJobs.length > 0 && (
            <section className="space-y-4">
              <SectionLabel>Closed roles ({closedJobs.length})</SectionLabel>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {closedJobs.map((job) => (
                  <JobCard key={job.id} job={job} canManage={canManage} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      )}
    </div>
  );
}
