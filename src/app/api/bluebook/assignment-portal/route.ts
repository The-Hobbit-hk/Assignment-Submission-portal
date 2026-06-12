import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { serializeTask } from "@/lib/bluebook";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { fetchAssignableCouncilMembers } from "@/lib/council-assignees";
import { DISTRICT_ROLES } from "@/lib/roles";
import { createAndAssignTaskSchema } from "@/lib/validators/bluebook";
import { handleRouteError, validationError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  try {
    const [assignments, members, tasks] = await Promise.all([
      prisma.councilBluebookAssignment.findMany({
        include: {
          task: true,
          assignee: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      fetchAssignableCouncilMembers(prisma),
      prisma.bluebookTask.findMany({
        where: { month, year, isActive: true },
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
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    return jsonCached(
      {
        assignments: assignments.map(serializeCouncilAssignment),
        members,
        tasks: tasks.map(serializeTask),
      },
      { maxAge: 60 }
    );
  } catch (err) {
    return handleRouteError(err, "Failed to load assignment portal.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createAndAssignTaskSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { assigneeIds, notes, ...taskData } = parsed.data;
    const dueDate = new Date(taskData.dueDate);

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.bluebookTask.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          maxScore: taskData.maxScore,
          dueDate,
          month: taskData.month,
          year: taskData.year,
        },
        include: { _count: { select: { submissions: true } } },
      });

      const assignments = [];
      for (const assigneeId of assigneeIds) {
        const assignment = await tx.councilBluebookAssignment.upsert({
          where: { taskId_assigneeId: { taskId: task.id, assigneeId } },
          create: {
            taskId: task.id,
            assigneeId,
            assignedById: session!.user.id,
            notes: notes ?? null,
          },
          update: {
            notes: notes ?? null,
            assignedById: session!.user.id,
          },
          include: {
            task: true,
            assignee: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true } },
          },
        });
        assignments.push(serializeCouncilAssignment(assignment));
      }

      return {
        task: serializeTask(task),
        assignments,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create and assign task.");
  }
}
