"use client";

import { Briefcase, Mail, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildJobApplyEmailUrl, type SerializedJobPosting } from "@/lib/jobs";
import { useDeleteJobPosting, useUpdateJobPosting } from "@/hooks/use-jobs";
import { toast } from "@/lib/toast";

export function JobCard({
  job,
  canManage,
}: {
  job: SerializedJobPosting;
  canManage: boolean;
}) {
  const { data: session } = useSession();
  const update = useUpdateJobPosting();
  const remove = useDeleteJobPosting();

  const applyUrl = buildJobApplyEmailUrl(job, {
    name: session?.user?.name,
    email: session?.user?.email,
  });

  async function toggleStatus() {
    try {
      await update.mutateAsync({
        id: job.id,
        status: job.status === "OPEN" ? "CLOSED" : "OPEN",
      });
      toast.success(job.status === "OPEN" ? "Job closed." : "Job reopened.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update job.");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}" at ${job.company}?`)) return;
    try {
      await remove.mutateAsync(job.id);
      toast.success("Job deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete job.");
    }
  }

  return (
    <article className="depth-card flex h-full flex-col rounded-xl border border-border/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
          {job.status === "OPEN" ? "Open" : "Closed"}
        </Badge>
      </div>

      <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {job.description}
      </p>

      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {job.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            {job.location}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-accent" />
          {job.recruiterName ? `${job.recruiterName} · ` : ""}
          {job.recruiterEmail}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.status === "OPEN" && (
          <Button asChild className="depth-btn-accent">
            <a href={applyUrl} target="_self" rel="noopener noreferrer">
              Apply via email
            </a>
          </Button>
        )}
        {canManage && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              disabled={update.isPending}
            >
              {job.status === "OPEN" ? "Close" : "Reopen"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
