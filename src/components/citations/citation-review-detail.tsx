"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { CitationStatusBadge } from "@/components/citations/citation-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCitationAssignment, useReviewCitation } from "@/hooks/use-citations";
import { toast } from "@/lib/toast";

export function CitationReviewDetail({ assignmentId }: { assignmentId: string }) {
  const { data, isLoading } = useCitationAssignment(assignmentId);
  const review = useReviewCitation(assignmentId);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (data?.reviewerComment) setComment(data.reviewerComment);
  }, [data?.reviewerComment]);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!data) {
    return <p className="text-destructive">Could not load citation assignment.</p>;
  }

  const isReviewed = data.status === "APPROVED" || data.status === "REJECTED";
  const canReview = data.status === "SUBMITTED";

  const submitReview = (status: "APPROVED" | "REJECTED") => {
    review.mutate(
      { status, reviewerComment: comment || undefined },
      {
        onSuccess: (updated) => {
          toast.success(
            status === "APPROVED"
              ? `Citation approved — ${updated.awardedPoints} pts will show under ${updated.periodLabel} (${updated.cadence.toLowerCase()}) standings`
              : "Citation rejected"
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/citations/review">
          <ArrowLeft className="h-4 w-4" />
          Back to queue
        </Link>
      </Button>

      <PageHeading
        title={data.definition.title}
        subtitle={`${data.club.name} · ${data.periodLabel} · ${data.definition.points} pts`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <CitationStatusBadge status={data.status} />
        {data.submittedAt && (
          <span className="text-sm text-muted-foreground">
            Submitted {new Date(data.submittedAt).toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {data.status === "APPROVED" && (
        <div className="flex items-start gap-3 rounded-xl border border-green-500/25 bg-green-50/80 p-4 dark:bg-green-950/20">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-400">Approved</p>
            <p className="mt-1 text-sm text-green-700/90 dark:text-green-500/90">
              {data.awardedPoints} points awarded
              {data.reviewedAt &&
                ` · Reviewed ${new Date(data.reviewedAt).toLocaleString("en-IN")}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Club notes</p>
          <p className="mt-1 text-sm whitespace-pre-wrap">
            {data.clubNotes || "No notes provided."}
          </p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Proof</p>
          {data.proofUrl ? (
            <a
              href={data.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View proof <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No proof uploaded.</p>
          )}
        </div>
      </div>

      {(canReview || isReviewed) && (
        <div className="depth-card space-y-4 rounded-xl p-5">
          <p className="text-sm font-semibold">DRR review</p>
          <Textarea
            placeholder="Reviewer comments (optional for approval, recommended for rejection)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isReviewed}
            rows={3}
          />
          {canReview && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => submitReview("APPROVED")}
                disabled={review.isPending}
              >
                Approve ({data.definition.points} pts)
              </Button>
              <Button
                variant="destructive"
                onClick={() => submitReview("REJECTED")}
                disabled={review.isPending}
              >
                Reject
              </Button>
            </div>
          )}
          {data.status === "REJECTED" && data.reviewerComment && (
            <p className="text-sm text-destructive">Rejection reason: {data.reviewerComment}</p>
          )}
        </div>
      )}
    </div>
  );
}
