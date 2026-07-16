import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { serializeTask } from "@/lib/bluebook";
import { updateTaskSchema } from "@/lib/validators/bluebook";
import { handleRouteError, notFound, validationError } from "@/lib/api-errors";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const task = await prisma.bluebookTask.findUnique({
      where: { id },
      include: {
        submissions: {
          include: { club: { select: { id: true, name: true } } },
        },
      },
    });
    if (!task) return notFound("Not found.");
    return NextResponse.json(serializeTask(task));
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    const due = d.dueDate ? new Date(d.dueDate) : undefined;

    const task = await prisma.bluebookTask.update({
      where: { id },
      data: {
        ...(d.title !== undefined && { title: d.title }),
        ...(d.description !== undefined && { description: d.description }),
        ...(d.category !== undefined && { category: d.category }),
        ...(d.maxScore !== undefined && { maxScore: d.maxScore }),
        ...(due && { dueDate: due, month: due.getMonth() + 1, year: due.getFullYear() }),
      },
      include: { _count: { select: { submissions: true } } },
    });

    return NextResponse.json(serializeTask(task));
  } catch (err) {
    return handleRouteError(err, "Failed to update task.");
  }
}
