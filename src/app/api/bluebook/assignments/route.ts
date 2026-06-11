import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { DISTRICT_ROLES } from "@/lib/roles";

const assignSchema = z.object({
  taskId: z.string(),
  assigneeIds: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

export async function GET() {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const assignments = await prisma.councilBluebookAssignment.findMany({
      include: {
        task: true,
        assignee: { select: { id: true, name: true, email: true } },
        assignedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments.map(serializeCouncilAssignment));
  } catch {
    return NextResponse.json({ error: "Failed to fetch assignments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid assignment data." }, { status: 400 });
    }

    const { taskId, assigneeIds, notes } = parsed.data;
    const created = [];

    for (const assigneeId of assigneeIds) {
      const assignment = await prisma.councilBluebookAssignment.upsert({
        where: { taskId_assigneeId: { taskId, assigneeId } },
        create: {
          taskId,
          assigneeId,
          assignedById: session!.user.id,
          notes: notes ?? null,
        },
        update: { notes: notes ?? null, assignedById: session!.user.id },
        include: {
          task: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
      created.push(serializeCouncilAssignment(assignment));
    }

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to assign tasks." }, { status: 500 });
  }
}
