import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import { isCycleOpen } from "@/lib/bluebook-labels";
import { submitCouncilReportSchema } from "@/lib/validators/bluebook-cycle";
import { DISTRICT_ROLES } from "@/lib/roles";

export async function POST(request: Request) {
  const { session, error } = await requireRole(["COUNCIL_MEMBER", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const body = submitCouncilReportSchema.parse(await request.json());
    const cycle = await getOrCreateCycle(prisma, body.month, body.year);

    if (!cycle.isActive || !isCycleOpen(cycle.closesAt, cycle.opensAt)) {
      return NextResponse.json({ error: "Submission window is closed." }, { status: 403 });
    }

    const assignments = await prisma.councilBluebookAssignment.findMany({
      where: {
        assigneeId: session!.user.id,
        task: { month: body.month, year: body.year },
        status: "DRAFT",
      },
    });

    if (assignments.length === 0) {
      const anyAssigned = await prisma.councilBluebookAssignment.count({
        where: {
          assigneeId: session!.user.id,
          task: { month: body.month, year: body.year },
        },
      });
      if (anyAssigned === 0) {
        return NextResponse.json({ error: "No tasks assigned for this period." }, { status: 400 });
      }
    }

    const existing = await prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id } },
    });

    if (existing && existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Blue Book already submitted for this period." }, { status: 403 });
    }

    const proofUrls = (existing?.proofUrls as string[] | null) ?? [];
    if (proofUrls.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one supporting document (PDF) before submitting." },
        { status: 400 }
      );
    }

    const now = new Date();

    const [report] = await prisma.$transaction([
      prisma.councilBluebookReport.upsert({
        where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id } },
        create: {
          cycleId: cycle.id,
          assigneeId: session!.user.id,
          submissionNotes: body.submissionNotes ?? null,
          proofUrls,
          status: "SUBMITTED",
          submittedAt: now,
        },
        update: {
          submissionNotes: body.submissionNotes ?? null,
          status: "SUBMITTED",
          submittedAt: now,
        },
        include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
      }),
      prisma.councilBluebookAssignment.updateMany({
        where: {
          assigneeId: session!.user.id,
          task: { month: body.month, year: body.year },
          status: "DRAFT",
        },
        data: { status: "SUBMITTED", submittedAt: now },
      }),
    ]);

    return NextResponse.json(serializeReport(report));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Submission failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
