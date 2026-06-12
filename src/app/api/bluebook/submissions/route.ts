import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeSubmission } from "@/lib/bluebook";
import { handleRouteError, apiError, notFound } from "@/lib/api-errors";

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { taskId, clubId } = await request.json();
    if (!taskId || !clubId) {
      return apiError("taskId and clubId required.", 400);
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
