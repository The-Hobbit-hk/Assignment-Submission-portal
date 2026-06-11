import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeSubmission } from "@/lib/bluebook";

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { taskId, clubId } = await request.json();
    if (!taskId || !clubId) {
      return NextResponse.json({ error: "taskId and clubId required." }, { status: 400 });
    }

    const task = await prisma.bluebookTask.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

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
  } catch {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
