import type { BluebookSubmissionStatus } from "@/generated/prisma/client";
import { reportStatusLabel, taskStatusLabel } from "@/lib/bluebook-labels";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";

export type SerializedCouncilAssignment = ReturnType<typeof serializeCouncilAssignment>;

/** A task counts as complete once the District Secretary marks it approved. */
export function isTaskCompleted(status: BluebookSubmissionStatus | string) {
  return status === "APPROVED";
}

/**
 * Fair ranking metric: completed tasks ÷ assigned tasks.
 * Example: 4/4 = 100%, 10/14 = 71%.
 */
export function taskCompletionPercent(
  assignments: { status: string }[]
): number | null {
  if (assignments.length === 0) return null;
  const done = assignments.filter((a) => isTaskCompleted(a.status)).length;
  return Math.round((done / assignments.length) * 100);
}

export type CouncilMemberBluebookRow = {
  member: { id: string; name: string | null; email: string };
  assignments: SerializedCouncilAssignment[];
  assignedCount: number;
  submittedCount: number;
  approvedCount: number;
  draftCount: number;
  rejectedCount: number;
  completed: boolean;
  reportStatus: string | null;
  submissionStatusLabel: string;
  reviewStatusLabel: string;
  pointsAwarded: number;
  pointsPossible: number;
  /** Task completion % (approved ÷ assigned). Primary ranking metric. */
  percentageScore: number | null;
  tasksCompleted: number;
};

export type CouncilBluebookSummary = {
  totalMembers: number;
  membersWithAssignments: number;
  membersComplete: number;
  membersIncomplete: number;
  totalAssignments: number;
  submitted: number;
  approved: number;
  draft: number;
  rejected: number;
  pendingSubmissions: number;
  lateSubmissions: number;
  reviewedReports: number;
  pendingReview: number;
};

export function isCouncilAssignmentSubmitted(status: BluebookSubmissionStatus | string) {
  return status === "SUBMITTED" || status === "APPROVED";
}

export function isCouncilMemberBluebookComplete(assignments: { status: string }[]) {
  if (assignments.length === 0) return false;
  return assignments.every((a) => isCouncilAssignmentSubmitted(a.status));
}

export function buildCouncilMemberRows(
  members: { id: string; name: string | null; email: string }[],
  assignments: SerializedCouncilAssignment[],
  reportsByAssignee: Record<string, { status: string } | undefined> = {}
): CouncilMemberBluebookRow[] {
  return members.map((member) => {
    const memberAssignments = assignments.filter((a) => a.assigneeId === member.id);
    const submittedCount = memberAssignments.filter((a) =>
      isCouncilAssignmentSubmitted(a.status)
    ).length;
    const approvedCount = memberAssignments.filter((a) => a.status === "APPROVED").length;
    const draftCount = memberAssignments.filter((a) => a.status === "DRAFT").length;
    const rejectedCount = memberAssignments.filter((a) => a.status === "REJECTED").length;
    const report = reportsByAssignee[member.id];
    const reportStatus = report?.status ?? null;
    const pointsPossible = memberAssignments.reduce(
      (sum, a) => sum + (a.task?.maxScore ?? 0),
      0
    );
    const pointsAwarded = memberAssignments.reduce((sum, a) => sum + a.allocatedScore, 0);
    const percentageScore = taskCompletionPercent(memberAssignments);

    const hasAssignments = memberAssignments.length > 0;
    const submissionStatusLabel = reportStatusLabel(reportStatus ?? "DRAFT", hasAssignments);
    const reviewStatusLabel =
      approvedCount === memberAssignments.length && hasAssignments
        ? "Completed"
        : reportStatus === "SUBMITTED"
          ? "Pending Review"
          : reportStatus === "APPROVED"
            ? "Completed"
            : hasAssignments
              ? "Not Submitted"
              : "—";

    return {
      member,
      assignments: memberAssignments.map((a) => ({
        ...a,
        statusLabel: taskStatusLabel(a.status),
      })),
      assignedCount: memberAssignments.length,
      submittedCount,
      approvedCount,
      draftCount,
      rejectedCount,
      completed: isCouncilMemberBluebookComplete(memberAssignments),
      reportStatus,
      submissionStatusLabel,
      reviewStatusLabel,
      pointsAwarded,
      pointsPossible,
      percentageScore,
      tasksCompleted: approvedCount,
    };
  });
}

export function matchesReviewStatusFilter(
  row: CouncilMemberBluebookRow,
  filter: string
): boolean {
  switch (filter) {
    case "not_submitted":
      return row.reportStatus === "DRAFT" || row.reportStatus === null;
    case "under_review":
      return row.reportStatus === "SUBMITTED";
    case "reviewed":
      return row.reportStatus === "APPROVED";
    default:
      return true;
  }
}

export function summarizeCouncilBluebook(
  rows: CouncilMemberBluebookRow[],
  reports: { status: string; submittedAt: Date | null }[] = [],
  cycleClosesAt?: Date
): CouncilBluebookSummary {
  const membersWithAssignments = rows.filter((r) => r.assignedCount > 0).length;
  const membersComplete = rows.filter((r) => r.completed).length;
  const allAssignments = rows.flatMap((r) => r.assignments);

  const pendingSubmissions = rows.filter(
    (r) => r.assignedCount > 0 && (r.reportStatus === "DRAFT" || r.reportStatus === null)
  ).length;
  const reviewedReports = reports.filter((r) => r.status === "APPROVED").length;
  const pendingReview = reports.filter((r) => r.status === "SUBMITTED").length;
  const lateSubmissions =
    cycleClosesAt != null
      ? reports.filter(
          (r) =>
            r.submittedAt != null &&
            r.submittedAt > cycleClosesAt &&
            (r.status === "SUBMITTED" || r.status === "APPROVED")
        ).length
      : 0;

  return {
    totalMembers: rows.length,
    membersWithAssignments,
    membersComplete,
    membersIncomplete: membersWithAssignments - membersComplete,
    totalAssignments: allAssignments.length,
    submitted: allAssignments.filter((a) => a.status === "SUBMITTED").length,
    approved: allAssignments.filter((a) => a.status === "APPROVED").length,
    draft: allAssignments.filter((a) => a.status === "DRAFT").length,
    rejected: allAssignments.filter((a) => a.status === "REJECTED").length,
    pendingSubmissions,
    lateSubmissions,
    reviewedReports,
    pendingReview,
  };
}
