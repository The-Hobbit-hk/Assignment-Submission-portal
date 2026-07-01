import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getClubUserClubId, canAccessClubRecord } from "@/lib/club-access";
import { isClubUser, isDistrictSecretary } from "@/lib/roles";
import { serializeSubmission } from "@/lib/bluebook";
import { handleRouteError, apiError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!isClubUser(role) && !isDistrictSecretary(role)) {
    return forbidden();
  }

  try {
    const { taskId, clubId: bodyClubId } = await request.json();
    // Club users may only submit for their own club; never trust the body clubId.
    const ownClubId = getClubUserClubId({ role, clubId: session!.user.clubId });
    const clubId = ownClubId ?? bodyClubId;

    if (!taskId || !clubId) {
      return apiError("taskId and clubId required.", 400);
    }

    if (!canAccessClubRecord({ role, clubId: session!.user.clubId }, clubId)) {
      return forbidden();
    }

    const task = await prisma.bluebookTask.findUnique({ where: { id: taskId } });
    if (!task) return notFound("Task not found.");

    const status =
      new Date() > task.dueDate ? "EXPIRED" : "DRAFT";

    const submission = await prisma.bluebookSubmission.upsert({
      where: { taskId_clubId: { taskId, clubId } },
      create: { taskId, clubId, status },
      update: {},
      include: {
        club: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, maxScore: true, dueDate: true } },
      },
    });

    return NextResponse.json(serializeSubmission(submission), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
