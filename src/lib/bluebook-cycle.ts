import type { BluebookCycle, CouncilBluebookReport } from "@/generated/prisma/client";
import { getReportingPeriodLabel } from "@/lib/reporting";
import { isCycleOpen } from "@/lib/bluebook-labels";

export function serializeCycle(cycle: BluebookCycle) {
  const now = new Date();
  return {
    id: cycle.id,
    title: cycle.title,
    month: cycle.month,
    year: cycle.year,
    periodLabel: getReportingPeriodLabel(cycle.month, cycle.year),
    opensAt: cycle.opensAt.toISOString(),
    closesAt: cycle.closesAt.toISOString(),
    isActive: cycle.isActive,
    isOpen: cycle.isActive && isCycleOpen(cycle.closesAt, cycle.opensAt, now),
  };
}

export function serializeReport(
  report: CouncilBluebookReport & {
    cycle?: BluebookCycle;
    assignee?: { id: string; name: string | null; email: string };
  }
) {
  const proofUrls = Array.isArray(report.proofUrls)
    ? (report.proofUrls as string[])
    : [];

  return {
    id: report.id,
    cycleId: report.cycleId,
    assigneeId: report.assigneeId,
    assigneeName: report.assignee?.name ?? report.assignee?.email ?? null,
    submissionNotes: report.submissionNotes,
    proofUrls,
    status: report.status,
    submittedAt: report.submittedAt?.toISOString() ?? null,
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
    reviewerComment: report.reviewerComment,
    cycle: report.cycle ? serializeCycle(report.cycle) : undefined,
  };
}

export async function getOrCreateCycle(
  prisma: {
    bluebookCycle: {
      findUnique: (args: {
        where: { month_year: { month: number; year: number } };
      }) => Promise<BluebookCycle | null>;
      create: (args: {
        data: {
          title: string;
          month: number;
          year: number;
          opensAt: Date;
          closesAt: Date;
        };
      }) => Promise<BluebookCycle>;
    };
  },
  month: number,
  year: number
) {
  const existing = await prisma.bluebookCycle.findUnique({
    where: { month_year: { month, year } },
  });
  if (existing) return existing;

  const opensAt = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const closesAt = new Date(year, month - 1, 10, 23, 59, 59, 999);

  return prisma.bluebookCycle.create({
    data: {
      title: `Blue Book — ${getReportingPeriodLabel(month, year)}`,
      month,
      year,
      opensAt,
      closesAt,
    },
  });
}
