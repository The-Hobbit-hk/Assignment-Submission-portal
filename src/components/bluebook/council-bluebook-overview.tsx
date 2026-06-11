"use client";

import { useState } from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BluebookStatusBadge } from "@/components/bluebook/bluebook-status-badge";
import { useCouncilBluebookOverview } from "@/hooks/use-council-assignments";
import { getReportingPeriodLabel } from "@/lib/reporting";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
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
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, isError } = useCouncilBluebookOverview(month, year);
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
          <span className="text-muted-foreground">Month</span>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              <SummaryCard label="Council members" value={summary.totalMembers} />
              <SummaryCard label="With tasks" value={summary.membersWithAssignments} />
              <SummaryCard label="Fully complete" value={summary.membersComplete} accent="text-green-600" />
              <SummaryCard label="Incomplete" value={summary.membersIncomplete} accent="text-destructive" />
              <SummaryCard label="Total tasks" value={summary.totalAssignments} />
              <SummaryCard label="Submitted" value={summary.submitted} />
              <SummaryCard label="Approved" value={summary.approved} accent="text-green-600" />
              <SummaryCard label="Draft" value={summary.draft} />
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">By council member</h2>
            <div className="table-scroll rounded-lg border border-border/40">
              <Table className="ref-table min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Council member</TableHead>
                    <TableHead>Tasks assigned</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Draft</TableHead>
                    <TableHead>Monthly complete</TableHead>
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
                        <TableCell>{row.submittedCount}</TableCell>
                        <TableCell>{row.approvedCount}</TableCell>
                        <TableCell>{row.draftCount}</TableCell>
                        <TableCell>
                          {row.assignedCount === 0 ? (
                            <span className="text-sm text-muted-foreground">No tasks</span>
                          ) : row.completed ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                              <XCircle className="h-4 w-4" />
                              Incomplete
                            </span>
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
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No bluebook submissions for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.assigneeName}</TableCell>
                        <TableCell>{submission.task?.title ?? "—"}</TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
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
