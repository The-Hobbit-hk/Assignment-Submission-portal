import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { DISTRICT_ROLES } from "@/lib/roles";

export async function GET() {
  const { session, error } = await requireRole(["COUNCIL_MEMBER", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const assignments = await prisma.councilBluebookAssignment.findMany({
      where: { assigneeId: session!.user.id },
      include: {
        task: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { task: { dueDate: "asc" } },
    });
    return NextResponse.json(assignments.map(serializeCouncilAssignment));
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}
