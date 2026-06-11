import type { BluebookTask, BluebookSubmission, Club } from "@/generated/prisma/client";

type TaskSubmissionPreview = {
  id?: string;
  allocatedScore: number;
  status?: BluebookSubmission["status"];
  clubId?: string;
  club?: Pick<Club, "id" | "name">;
};

type TaskWithSubs = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  maxScore: number;
  dueDate: Date;
  month: number;
  year: number;
  isActive: boolean;
  createdAt: Date;
  submissions?: TaskSubmissionPreview[];
  _count?: { submissions: number };
};

export function serializeTask(t: TaskWithSubs) {
  const isExpired = new Date() > t.dueDate && t.isActive;
  const topSubmission = t.submissions?.[0];
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    maxScore: t.maxScore,
    dueDate: t.dueDate.toISOString(),
    month: t.month,
    year: t.year,
    isActive: t.isActive,
    isExpired,
    scored: topSubmission?.allocatedScore ?? 0,
    submissionCount: t._count?.submissions ?? t.submissions?.length ?? 0,
    submissions: t.submissions?.map((s) => ({
      id: s.id,
      allocatedScore: s.allocatedScore,
      status: s.status,
      clubId: s.clubId,
      club: s.club,
    })),
    createdAt: t.createdAt.toISOString(),
  };
}

export function serializeSubmission(
  s: BluebookSubmission & {
    club?: Pick<Club, "id" | "name">;
    task?: Pick<BluebookTask, "id" | "title" | "maxScore" | "dueDate">;
  }
) {
  return {
    id: s.id,
    taskId: s.taskId,
    clubId: s.clubId,
    club: s.club,
    task: s.task,
    proofUrl: s.proofUrl,
    allocatedScore: s.allocatedScore,
    reviewerComment: s.reviewerComment,
    status: s.status,
    submittedAt: s.submittedAt?.toISOString() ?? null,
    reviewedAt: s.reviewedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

export async function getBluebookAnalytics(
  prisma: typeof import("@/lib/prisma").prisma,
  month: number,
  year: number
) {
  const now = new Date();

  const [
    totalTasks,
    expiredTasks,
    totalMaxScore,
    totalAllocated,
    approved,
    pending,
    clubScores,
  ] = await Promise.all([
    prisma.bluebookTask.count({ where: { month, year } }),
    prisma.bluebookTask.count({
      where: { month, year, dueDate: { lt: now } },
    }),
    prisma.bluebookTask.aggregate({
      where: { month, year },
      _sum: { maxScore: true },
    }),
    prisma.bluebookSubmission.aggregate({
      where: { status: "APPROVED", task: { month, year } },
      _sum: { allocatedScore: true },
    }),
    prisma.bluebookSubmission.count({
      where: { status: "APPROVED", task: { month, year } },
    }),
    prisma.bluebookSubmission.count({
      where: { status: "SUBMITTED", task: { month, year } },
    }),
    prisma.bluebookSubmission.groupBy({
      by: ["clubId"],
      where: { status: "APPROVED", task: { month, year } },
      _sum: { allocatedScore: true },
    }),
  ]);

  return {
    month,
    year,
    totalTasks,
    expiredTasks,
    totalMaxScore: totalMaxScore._sum.maxScore ?? 0,
    totalAllocated: totalAllocated._sum.allocatedScore ?? 0,
    approvedSubmissions: approved,
    pendingReview: pending,
    completionRate:
      totalTasks > 0 ? Math.round((approved / (totalTasks * 4)) * 100) : 0,
    clubScores: clubScores.map((c) => ({
      clubId: c.clubId,
      score: c._sum.allocatedScore ?? 0,
    })),
  };
}
