import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeTask } from "@/lib/bluebook";
import { handleRouteError, notFound } from "@/lib/api-errors";

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
