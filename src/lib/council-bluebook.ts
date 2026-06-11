import type { CouncilBluebookAssignment } from "@/generated/prisma/client";

type AssignmentWithRelations = CouncilBluebookAssignment & {
  task?: { id: string; title: string; description: string | null; category: string; maxScore: number; dueDate: Date };
  assignee?: { id: string; name: string | null; email: string };
  assignedBy?: { id: string; name: string | null };
};

export function serializeCouncilAssignment(a: AssignmentWithRelations) {
  const isExpired = a.task ? new Date() > a.task.dueDate : false;
  return {
    id: a.id,
    taskId: a.taskId,
    assigneeId: a.assigneeId,
    assigneeName: a.assignee?.name ?? a.assignee?.email ?? "Unknown",
    assigneeEmail: a.assignee?.email ?? null,
    assignedById: a.assignedById,
    task: a.task
      ? {
          id: a.task.id,
          title: a.task.title,
          description: a.task.description,
          category: a.task.category,
          maxScore: a.task.maxScore,
          dueDate: a.task.dueDate.toISOString(),
          isExpired,
        }
      : undefined,
    proofUrl: a.proofUrl,
    allocatedScore: a.allocatedScore,
    reviewerComment: a.reviewerComment,
    status: a.status,
    notes: a.notes,
    submittedAt: a.submittedAt?.toISOString() ?? null,
    reviewedAt: a.reviewedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}
