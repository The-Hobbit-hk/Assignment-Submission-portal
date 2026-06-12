import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { jsonCached } from "@/lib/api-response";
import { getBluebookAnalytics, serializeTask } from "@/lib/bluebook";
import { createTaskSchema, taskQuerySchema } from "@/lib/validators/bluebook";
import { validationError, handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = taskQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { month, year, category, expired, clubId } = parsed.data;
  const now = new Date();
  const withSummary = searchParams.get("summary") === "true";

  try {
    const taskQuery = prisma.bluebookTask.findMany({
      where: {
        ...(month && { month }),
        ...(year && { year }),
        ...(category && { category }),
        ...(expired && { dueDate: { lt: now } }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        maxScore: true,
        dueDate: true,
        month: true,
        year: true,
        isActive: true,
        createdAt: true,
        _count: { select: { submissions: true } },
        submissions: {
          ...(clubId ? { where: { clubId } } : {}),
          select: { id: true, allocatedScore: true, status: true, clubId: true },
          orderBy: { allocatedScore: "desc" },
          take: 1,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    if (withSummary && month && year) {
      const [tasks, analytics] = await Promise.all([
        taskQuery,
        getBluebookAnalytics(prisma, month, year),
      ]);
      return jsonCached(
        { tasks: tasks.map(serializeTask), analytics },
        { maxAge: 120 }
      );
    }

    const tasks = await taskQuery;
    return jsonCached(tasks.map(serializeTask), { maxAge: 120 });
  } catch (err) {
    return handleRouteError(err, "Failed to fetch tasks.");
  }
}

export async function POST(request: Request) {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    const task = await prisma.bluebookTask.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        maxScore: d.maxScore,
        dueDate: new Date(d.dueDate),
        month: d.month,
        year: d.year,
      },
      include: { _count: { select: { submissions: true } } },
    });

    return NextResponse.json(serializeTask(task), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create task.");
  }
}
