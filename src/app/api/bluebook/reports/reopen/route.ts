import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import { canAssignBluebook } from "@/lib/roles";
import { z } from "zod";

const reopenSchema = z.object({
  memberId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = reopenSchema.parse(await request.json());
    const cycle = await getOrCreateCycle(prisma, body.month, body.year);

    const report = await prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: body.memberId } },
      include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    if (!report || report.status === "DRAFT") {
      return NextResponse.json({ error: "No submitted report to reopen." }, { status: 400 });
    }

    const [updated] = await prisma.$transaction([
      prisma.councilBluebookReport.update({
        where: { id: report.id },
        data: {
          status: "DRAFT",
          submittedAt: null,
          reviewedAt: null,
          reviewedById: null,
        },
        include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
      }),
      prisma.councilBluebookAssignment.updateMany({
        where: {
          assigneeId: body.memberId,
          task: { month: body.month, year: body.year },
          status: { in: ["SUBMITTED", "APPROVED"] },
        },
        data: { status: "DRAFT", submittedAt: null, reviewedAt: null, allocatedScore: 0 },
      }),
    ]);

    return NextResponse.json(serializeReport(updated));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reopen failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
