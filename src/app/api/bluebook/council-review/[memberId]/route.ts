import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { taskCompletionPercent } from "@/lib/council-bluebook-status";
import { getOrCreateCycle, serializeCycle, serializeReport } from "@/lib/bluebook-cycle";
import { reviewCouncilMemberSchema } from "@/lib/validators/bluebook-cycle";
import { ensureCouncilScoresSynced } from "@/lib/council";
import { DISTRICT_COUNCIL_CLUB } from "@/lib/council-roster-data";
import { canAssignBluebook } from "@/lib/roles";
import { handleRouteError, apiError, notFound, forbidden } from "@/lib/api-errors";

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
  const tasksAssigned = serialized.length;
  const tasksCompleted = serialized.filter((a) => a.status === "APPROVED").length;
  const percentageScore = taskCompletionPercent(serialized);

  return {
    month,
    year,
    member,
    cycle: serializeCycle(cycle),
    report: report ? serializeReport(report) : null,
    assignments: serialized,
    totals: {
      tasksAssigned,
      tasksCompleted,
      percentageScore,
      // Kept for older clients; prefer tasksAssigned / tasksCompleted.
      pointsPossible: tasksAssigned,
      pointsAwarded: tasksCompleted,
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
    return forbidden();
  }

  const { memberId } = await params;
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);

  try {
    const data = await loadReview(memberId, month, year);
    if (!data) {
      return notFound("Member not found.");
    }
    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError(err, "Failed to load review.");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return forbidden();
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

      const completed = row.completed;
      await prisma.councilBluebookAssignment.update({
        where: { id: row.assignmentId },
        data: {
          // Store 1/0 so legacy fields still reflect completion.
          allocatedScore: completed ? 1 : 0,
          reviewerComment: body.reviewerComment ?? assignment.reviewerComment,
          ...(body.markReviewed
            ? {
                status: completed ? ("APPROVED" as const) : ("REJECTED" as const),
                reviewedAt: now,
              }
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
    }

    const updatedAssignments = await prisma.councilBluebookAssignment.findMany({
      where: { assigneeId: memberId, task: { month: body.month, year: body.year } },
      select: { status: true },
    });
    const completionPct = taskCompletionPercent(updatedAssignments) ?? 0;
    await prisma.member.updateMany({
      where: {
        userId: memberId,
        club: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
      },
      data: { points: completionPct },
    });

    await ensureCouncilScoresSynced(prisma, body.month, body.year, true);

    const data = await loadReview(memberId, body.month, body.year);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Review failed.";
    return apiError(message, 400);
  }
}
