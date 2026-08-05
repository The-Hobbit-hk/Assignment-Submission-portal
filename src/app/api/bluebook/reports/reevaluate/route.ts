import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import { canAssignBluebook } from "@/lib/roles";
import { z } from "zod";
import { apiError, forbidden } from "@/lib/api-errors";

const reevaluateSchema = z.object({
  memberId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

/**
 * Unlock a completed review so the secretary can change task completion again.
 * Keeps the member's submission intact (unlike /reports/reopen).
 */
export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return forbidden();
  }

  try {
    const body = reevaluateSchema.parse(await request.json());
    const cycle = await getOrCreateCycle(prisma, body.month, body.year);

    const report = await prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: body.memberId } },
      include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    if (!report || report.status !== "APPROVED") {
      return apiError("Only a completed review can be re-evaluated.", 400);
    }

    const [updated] = await prisma.$transaction([
      prisma.councilBluebookReport.update({
        where: { id: report.id },
        data: {
          status: "SUBMITTED",
          reviewedAt: null,
          reviewedById: null,
        },
        include: {
          cycle: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
      // Keep completion scores; reopen task rows for editing / re-marking.
      prisma.councilBluebookAssignment.updateMany({
        where: {
          assigneeId: body.memberId,
          task: { month: body.month, year: body.year },
          status: { in: ["APPROVED", "REJECTED"] },
        },
        data: { status: "SUBMITTED", reviewedAt: null },
      }),
    ]);

    return NextResponse.json(serializeReport(updated));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Re-evaluate failed.";
    return apiError(message, 400);
  }
}
