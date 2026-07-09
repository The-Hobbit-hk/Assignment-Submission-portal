"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BluebookStatusBadge } from "@/components/bluebook/bluebook-status-badge";
import { useCouncilBluebookOverview } from "@/hooks/use-council-assignments";
import { getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions } from "@/lib/rotary-year";
import { Download, ExternalLink, FileSpreadsheet } from "lucide-react";

const CATEGORIES = [
  "Reporting",
  "Service",
  "Membership",
  "Governance",
  "Administration",
  "Events",
  "Professional Development",
];

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="depth-card rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

export function CouncilBluebookOverview() {
  const now = new Date();
  const monthOptions = rotaryMonthOptions(getCurrentRotaryYear(now).startYear, {
    long: true,
    withYear: true,
  });
  const [period, setPeriod] = useState(
    () => `${now.getMonth() + 1}-${now.getFullYear()}`
  );
  const [month, year] = period.split("-").map(Number);
  const [statusFilter, setStatusFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("");

  const { data, isLoading, isError } = useCouncilBluebookOverview(month, year, {
    status: statusFilter || undefined,
    memberId: memberFilter || undefined,
    category: categoryFilter || undefined,
    reviewStatus: reviewStatusFilter || undefined,
  });
  const periodLabel = getReportingPeriodLabel(month, year);
  const members = data?.members ?? [];
  const submissions = data?.submissions ?? [];
  const summary = data?.summary;

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        You do not have access to the council bluebook overview.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Council Bluebook Overview"
        subtitle={`Track bluebook submissions for all council members — ${periodLabel}. A member is complete when every assigned task for the period is submitted or approved.`}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Reporting period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Submission status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Reviewed</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Council member</span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="depth-card block max-w-[220px] rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">All members</option>
            {members.map((row) => (
              <option key={row.member.id} value={row.member.id}>
                {row.member.name ?? row.member.email}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Department</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Review status</span>
          <select
            value={reviewStatusFilter}
            onChange={(e) => setReviewStatusFilter(e.target.value)}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="not_submitted">Not submitted</option>
            <option value="under_review">Pending review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/api/reports/council-bluebook?format=excel&month=${month}&year=${year}`}
              download
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/api/reports/council-bluebook?format=pdf&month=${month}&year=${year}`}
              download
            >
              <Download className="h-4 w-4" />
              PDF
            </a>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <SummaryCard label="Council members" value={summary.totalMembers} />
              <SummaryCard label="With tasks" value={summary.membersWithAssignments} />
              <SummaryCard label="Pending submissions" value={summary.pendingSubmissions} accent="text-amber-600" />
              <SummaryCard label="Under review" value={summary.pendingReview} />
              <SummaryCard label="Reviewed" value={summary.reviewedReports} accent="text-green-600" />
              <SummaryCard label="Late submissions" value={summary.lateSubmissions} accent="text-destructive" />
              <SummaryCard label="Total tasks" value={summary.totalAssignments} />
              <SummaryCard label="Task submitted" value={summary.submitted} />
              <SummaryCard label="Task reviewed" value={summary.approved} accent="text-green-600" />
              <SummaryCard label="Task pending" value={summary.draft} />
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">By council member</h2>
            <div className="table-scroll rounded-lg border border-border/40">
              <Table className="ref-table min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Council member</TableHead>
                    <TableHead>Tasks assigned</TableHead>
                    <TableHead>Submission status</TableHead>
                    <TableHead>Review status</TableHead>
                    <TableHead>Points awarded</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No council members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((row) => (
                      <TableRow key={row.member.id}>
                        <TableCell>
                          <div className="font-medium">{row.member.name ?? row.member.email}</div>
                          <div className="text-xs text-muted-foreground">{row.member.email}</div>
                        </TableCell>
                        <TableCell>{row.assignedCount}</TableCell>
                        <TableCell>{row.submissionStatusLabel}</TableCell>
                        <TableCell>{row.reviewStatusLabel}</TableCell>
                        <TableCell>
                          {row.assignedCount > 0
                            ? `${row.pointsAwarded} / ${row.pointsPossible}${
                                row.percentageScore != null ? ` (${row.percentageScore}%)` : ""
                              }`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {row.assignedCount > 0 && (
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/bluebook/review/${row.member.id}?month=${month}&year=${year}`}
                              >
                                Review
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">All submissions</h2>
            <div className="table-scroll rounded-lg border border-border/40">
              <Table className="ref-table min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Council member</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                    <TableHead className="hidden lg:table-cell">Score</TableHead>
                    <TableHead className="hidden xl:table-cell">Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No bluebook submissions for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium align-top">{submission.assigneeName}</TableCell>
                        <TableCell className="align-top">{submission.task?.title ?? "—"}</TableCell>
                        <TableCell className="max-w-md align-top text-sm text-muted-foreground">
                          {submission.task?.description ? (
                            <p className="whitespace-pre-wrap">{submission.task.description}</p>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="hidden align-top text-muted-foreground sm:table-cell">
                          {submission.task?.category ?? "—"}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {submission.task?.dueDate
                            ? new Date(submission.task.dueDate).toLocaleDateString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <BluebookStatusBadge status={submission.status} />
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {submission.allocatedScore > 0
                            ? `${submission.allocatedScore} / ${submission.task?.maxScore ?? "—"}`
                            : "—"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {submission.proofUrl ? (
                            <a
                              href={submission.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                            >
                              View
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
