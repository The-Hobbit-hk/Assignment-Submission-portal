"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Save,
  Unlock,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { BluebookStatusBadge } from "@/components/bluebook/bluebook-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCouncilMemberReview,
  useReevaluateCouncilReport,
  useReopenCouncilReport,
  useReviewCouncilMember,
} from "@/hooks/use-council-assignments";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function CouncilMemberReview({
  memberId,
  month,
  year,
  returnTo,
}: {
  memberId: string;
  month: number;
  year: number;
  returnTo?: string;
}) {
  const { data, isLoading } = useCouncilMemberReview(memberId, month, year);
  const review = useReviewCouncilMember(memberId);
  const reopen = useReopenCouncilReport();
  const reevaluate = useReevaluateCouncilReport();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState("");
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  // Don't re-copy checkboxes/comment from the server on every query refresh —
  // that wiped mid-edit work after Save / reopen / re-evaluate.
  const hydratedKeyRef = useRef<string | null>(null);
  const reviewKey = `${memberId}:${month}:${year}`;

  useEffect(() => {
    hydratedKeyRef.current = null;
  }, [reviewKey]);

  useEffect(() => {
    if (!data) return;
    if (hydratedKeyRef.current === reviewKey) return;
    hydratedKeyRef.current = reviewKey;

    const initial: Record<string, boolean> = {};
    for (const a of data.assignments) {
      initial[a.id] =
        a.status === "APPROVED" || (a.status !== "REJECTED" && a.allocatedScore > 0);
    }
    setCompleted(initial);
    setComment(data.report?.reviewerComment ?? "");
  }, [data, reviewKey]);

  const resetFormHydration = () => {
    hydratedKeyRef.current = null;
  };

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!data) {
    return <p className="text-destructive">Could not load review data.</p>;
  }

  const { member, assignments, report, totals } = data;
  const isReviewed = report?.status === "APPROVED";
  const canEdit = !isReviewed && Boolean(report?.submittedAt);
  const canReopen = Boolean(report && report.status !== "DRAFT");
  const liveCompleted = assignments.filter((a) => completed[a.id]).length;
  const livePct =
    assignments.length > 0
      ? Math.round((liveCompleted / assignments.length) * 100)
      : null;

  const saveReview = (markReviewed: boolean) => {
    review.mutate(
      {
        month,
        year,
        scores: assignments.map((a) => ({
          assignmentId: a.id,
          completed: Boolean(completed[a.id]),
        })),
        reviewerComment: comment,
        markReviewed,
      },
      {
        onSuccess: () => {
          toast.success(markReviewed ? "Review saved and locked" : "Completion saved");
        },
      }
    );
  };

  const confirmReopen = () => {
    reopen.mutate(
      { memberId, month, year },
      {
        onSuccess: () => {
          resetFormHydration();
          setReopenDialogOpen(false);
          toast.success("Submission reopened for the member");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link
          href={
            returnTo ??
            `/dashboard/bluebook/council-overview?month=${month}&year=${year}`
          }
        >
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>
      </Button>

      <PageHeading
        title={member.name ?? member.email}
        subtitle={`Blue Book review — ${member.email}`}
        action={
          canReopen ? (
            <Button
              variant="destructive"
              disabled={reopen.isPending}
              onClick={() => setReopenDialogOpen(true)}
            >
              <Unlock className="h-4 w-4" />
              Reopen submission
            </Button>
          ) : undefined
        }
      />

      <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen this submission?</DialogTitle>
            <DialogDescription className="space-y-2 text-left">
              <span className="block">
                This unlocks the Blue Book for the member so they can edit and resubmit.
              </span>
              <span className="block font-medium text-amber-800 dark:text-amber-400">
                Warning: their current review lock will be cleared, task scores reset to draft, and
                council live scores for this month will update. This cannot be undone automatically.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReopenDialogOpen(false)}
              disabled={reopen.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reopen.isPending}
              onClick={confirmReopen}
            >
              {reopen.isPending ? "Reopening…" : "Yes, reopen submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isReviewed && (
        <div className="flex items-start gap-3 rounded-xl border border-green-500/25 bg-green-50/80 p-4 dark:bg-green-950/20">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-400">Review completed</p>
            <p className="mt-1 text-sm text-green-700/90 dark:text-green-500/90">
              Completion: {totals.tasksCompleted ?? totals.pointsAwarded} /{" "}
              {totals.tasksAssigned ?? totals.pointsPossible} tasks
              {totals.percentageScore != null && ` (${totals.percentageScore}%)`}
              {report?.reviewedAt &&
                ` · Reviewed on ${new Date(report.reviewedAt).toLocaleString("en-IN")}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Submission</p>
          <p className="mt-1 font-semibold">
            {report?.submittedAt
              ? new Date(report.submittedAt).toLocaleString("en-IN")
              : "Not submitted"}
          </p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Tasks completed</p>
          <p className="mt-1 text-2xl font-bold">
            {liveCompleted} / {assignments.length}
          </p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Completion (live)</p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {livePct != null ? `${livePct}%` : "—"}
          </p>
        </div>
      </div>

      {report?.submissionNotes && (
        <div className="depth-card rounded-xl p-4">
          <h3 className="text-sm font-semibold">Member notes</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {report.submissionNotes}
          </p>
        </div>
      )}

      {report?.proofUrls && report.proofUrls.length > 0 && (
        <div className="depth-card rounded-xl p-4">
          <h3 className="text-sm font-semibold">Uploaded reports</h3>
          <ul className="mt-2 space-y-1">
            {report.proofUrls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  Download / view
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-scroll rounded-lg border border-border/40">
        <Table className="ref-table min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium align-top">{a.task?.title ?? "—"}</TableCell>
                <TableCell className="max-w-md align-top text-sm text-muted-foreground">
                  {a.task?.description ? (
                    <p className="whitespace-pre-wrap">{a.task.description}</p>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <BluebookStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="align-top">
                  {isReviewed ? (
                    <span
                      className={cn(
                        "font-medium",
                        completed[a.id] ? "text-green-700" : "text-muted-foreground"
                      )}
                    >
                      {completed[a.id] ? "Yes" : "No"}
                    </span>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--accent))]"
                        checked={Boolean(completed[a.id])}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setCompleted((prev) => ({
                            ...prev,
                            [a.id]: e.target.checked,
                          }))
                        }
                      />
                      {completed[a.id] ? "Complete" : "Incomplete"}
                    </label>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Reviewer comment</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional feedback for the council member…"
          rows={3}
          disabled={!canEdit}
          readOnly={isReviewed}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isReviewed ? (
          <>
            <Button
              variant="outline"
              disabled={review.isPending || !canEdit}
              onClick={() => saveReview(false)}
            >
              <Save className="h-4 w-4" />
              {review.isPending ? "Saving…" : "Save completion"}
            </Button>
            <Button
              className="bg-accent text-accent-foreground"
              disabled={review.isPending || !report?.submittedAt}
              onClick={() => saveReview(true)}
            >
              {review.isPending ? "Saving…" : "Mark as reviewed"}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            disabled={reevaluate.isPending}
            onClick={() =>
              reevaluate.mutate(
                { memberId, month, year },
                {
                  onSuccess: () => {
                    resetFormHydration();
                    toast.success("Review unlocked — you can change task status again");
                  },
                }
              )
            }
          >
            <RefreshCw className="h-4 w-4" />
            {reevaluate.isPending ? "Unlocking…" : "Re-evaluate"}
          </Button>
        )}
      </div>
    </div>
  );
}
