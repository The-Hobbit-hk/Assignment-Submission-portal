"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { BluebookStatusBadge } from "@/components/bluebook/bluebook-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCouncilMemberReview,
  useReopenCouncilReport,
  useReviewCouncilMember,
} from "@/hooks/use-council-assignments";

export function CouncilMemberReview({
  memberId,
  month,
  year,
}: {
  memberId: string;
  month: number;
  year: number;
}) {
  const { data, isLoading } = useCouncilMemberReview(memberId, month, year);
  const review = useReviewCouncilMember(memberId);
  const reopen = useReopenCouncilReport();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!data) return;
    const initial: Record<string, number> = {};
    for (const a of data.assignments) {
      initial[a.id] = a.allocatedScore;
    }
    setScores(initial);
    setComment(data.report?.reviewerComment ?? "");
  }, [data]);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!data) {
    return <p className="text-destructive">Could not load review data.</p>;
  }

  const { member, assignments, report, totals } = data;
  const liveAwarded = assignments.reduce((s, a) => s + (scores[a.id] ?? 0), 0);
  const livePct =
    totals.pointsPossible > 0
      ? Math.round((liveAwarded / totals.pointsPossible) * 100)
      : null;

  const saveReview = (markReviewed: boolean) => {
    review.mutate({
      month,
      year,
      scores: assignments.map((a) => ({
        assignmentId: a.id,
        allocatedScore: scores[a.id] ?? 0,
      })),
      reviewerComment: comment,
      markReviewed,
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/bluebook/council-overview?month=${month}&year=${year}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>
      </Button>

      <PageHeading
        title={member.name ?? member.email}
        subtitle={`Blue Book review — ${member.email}`}
      />

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
          <p className="text-xs text-muted-foreground">Total possible</p>
          <p className="mt-1 text-2xl font-bold">{totals.pointsPossible}</p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Score (live)</p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {liveAwarded}
            {livePct != null && (
              <span className="ml-2 text-base font-normal text-muted-foreground">({livePct}%)</span>
            )}
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
        <Table className="ref-table min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Max points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Awarded points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.task?.title ?? "—"}</TableCell>
                <TableCell>{a.task?.maxScore ?? 0}</TableCell>
                <TableCell>
                  <BluebookStatusBadge status={a.status} />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={a.task?.maxScore ?? 100}
                    value={scores[a.id] ?? 0}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [a.id]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-24"
                  />
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
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={review.isPending}
          onClick={() => saveReview(false)}
        >
          <Save className="h-4 w-4" />
          Save scores
        </Button>
        <Button
          className="bg-accent text-accent-foreground"
          disabled={review.isPending || !report?.submittedAt}
          onClick={() => saveReview(true)}
        >
          Mark as reviewed
        </Button>
        {report && report.status !== "DRAFT" && (
          <Button
            variant="destructive"
            disabled={reopen.isPending}
            onClick={() => reopen.mutate({ memberId, month, year })}
          >
            Reopen submission
          </Button>
        )}
      </div>
    </div>
  );
}
