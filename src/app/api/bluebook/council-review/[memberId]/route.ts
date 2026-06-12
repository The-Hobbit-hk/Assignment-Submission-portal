import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { getOrCreateCycle, serializeCycle, serializeReport } from "@/lib/bluebook-cycle";
import { reviewCouncilMemberSchema } from "@/lib/validators/bluebook-cycle";
import { ensureCouncilScoresSynced } from "@/lib/council";
import { DISTRICT_COUNCIL_CLUB } from "@/lib/council-roster-data";
import { canAssignBluebook } from "@/lib/roles";

async function loadReview(memberId: string, month: number, year: number) {
  const cycle = await getOrCreateCycle(prisma, month, year);

  const [member, assignments, report] = await Promise.all([
    prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, email: true },
    }),
    prisma.councilBluebookAssignment.findMany({
      where: { assigneeId: memberId, task: { month, year } },
      include: {
        task: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { task: { dueDate: "asc" } },
    }),
    prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: memberId } },
      include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  if (!member) return null;

  const serialized = assignments.map(serializeCouncilAssignment);
  const pointsPossible = serialized.reduce((s, a) => s + (a.task?.maxScore ?? 0), 0);
  const pointsAwarded = serialized.reduce((s, a) => s + a.allocatedScore, 0);

  return {
    month,
    year,
    member,
    cycle: serializeCycle(cycle),
    report: report ? serializeReport(report) : null,
    assignments: serialized,
    totals: {
      pointsPossible,
      pointsAwarded,
      percentageScore:
        pointsPossible > 0 ? Math.round((pointsAwarded / pointsPossible) * 100) : null,
    },
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { memberId } = await params;
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);

  try {
    const data = await loadReview(memberId, month, year);
    if (!data) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load review." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { memberId } = await params;

  try {
    const body = reviewCouncilMemberSchema.parse(await request.json());
    const cycle = await getOrCreateCycle(prisma, body.month, body.year);
    const now = new Date();

    for (const row of body.scores) {
      const assignment = await prisma.councilBluebookAssignment.findFirst({
        where: {
          id: row.assignmentId,
          assigneeId: memberId,
          task: { month: body.month, year: body.year },
        },
        include: { task: true },
      });
      if (!assignment?.task) continue;
      const capped = Math.min(row.allocatedScore, assignment.task.maxScore);
      await prisma.councilBluebookAssignment.update({
        where: { id: row.assignmentId },
        data: {
          allocatedScore: capped,
          reviewerComment: body.reviewerComment ?? assignment.reviewerComment,
          ...(body.markReviewed
            ? { status: "APPROVED" as const, reviewedAt: now }
            : {}),
        },
      });
    }

    if (body.markReviewed) {
      await prisma.councilBluebookReport.upsert({
        where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: memberId } },
        create: {
          cycleId: cycle.id,
          assigneeId: memberId,
          status: "APPROVED",
          reviewedAt: now,
          reviewedById: session!.user.id,
          reviewerComment: body.reviewerComment ?? null,
        },
        update: {
          status: "APPROVED",
          reviewedAt: now,
          reviewedById: session!.user.id,
          reviewerComment: body.reviewerComment ?? undefined,
        },
      });

      await prisma.councilBluebookAssignment.updateMany({
        where: {
          assigneeId: memberId,
          task: { month: body.month, year: body.year },
          status: "SUBMITTED",
        },
        data: { status: "APPROVED", reviewedAt: now },
      });
    }

    const updatedAssignments = await prisma.councilBluebookAssignment.findMany({
      where: { assigneeId: memberId, task: { month: body.month, year: body.year } },
      select: { allocatedScore: true },
    });
    const totalAwarded = updatedAssignments.reduce((sum, a) => sum + a.allocatedScore, 0);
    await prisma.member.updateMany({
      where: {
        userId: memberId,
        club: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
      },
      data: { points: totalAwarded },
    });

    await ensureCouncilScoresSynced(prisma, body.month, body.year, true);

    const data = await loadReview(memberId, body.month, body.year);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Review failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
