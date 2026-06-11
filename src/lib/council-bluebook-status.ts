import type { BluebookSubmissionStatus } from "@/generated/prisma/client";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";

export type SerializedCouncilAssignment = ReturnType<typeof serializeCouncilAssignment>;

export type CouncilMemberBluebookRow = {
  member: { id: string; name: string | null; email: string };
  assignments: SerializedCouncilAssignment[];
  assignedCount: number;
  submittedCount: number;
  approvedCount: number;
  draftCount: number;
  rejectedCount: number;
  completed: boolean;
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
  assignments: SerializedCouncilAssignment[]
): CouncilMemberBluebookRow[] {
  return members.map((member) => {
    const memberAssignments = assignments.filter((a) => a.assigneeId === member.id);
    const submittedCount = memberAssignments.filter((a) =>
      isCouncilAssignmentSubmitted(a.status)
    ).length;
    const approvedCount = memberAssignments.filter((a) => a.status === "APPROVED").length;
    const draftCount = memberAssignments.filter((a) => a.status === "DRAFT").length;
    const rejectedCount = memberAssignments.filter((a) => a.status === "REJECTED").length;

    return {
      member,
      assignments: memberAssignments,
      assignedCount: memberAssignments.length,
      submittedCount,
      approvedCount,
      draftCount,
      rejectedCount,
      completed: isCouncilMemberBluebookComplete(memberAssignments),
    };
  });
}

export function summarizeCouncilBluebook(rows: CouncilMemberBluebookRow[]): CouncilBluebookSummary {
  const membersWithAssignments = rows.filter((r) => r.assignedCount > 0).length;
  const membersComplete = rows.filter((r) => r.completed).length;
  const allAssignments = rows.flatMap((r) => r.assignments);

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
  };
}
