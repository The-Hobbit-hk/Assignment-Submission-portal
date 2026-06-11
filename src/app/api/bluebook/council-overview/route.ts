import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import {
  buildCouncilMemberRows,
  summarizeCouncilBluebook,
} from "@/lib/council-bluebook-status";
import { canViewCouncilBluebookOverview } from "@/lib/roles";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canViewCouncilBluebookOverview(session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  try {
    const [members, assignments] = await Promise.all([
      prisma.user.findMany({
        where: { role: "COUNCIL_MEMBER" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.councilBluebookAssignment.findMany({
        where: {
          task: { month, year },
        },
        include: {
          task: true,
          assignee: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ assignee: { name: "asc" } }, { task: { dueDate: "asc" } }],
      }),
    ]);

    const serialized = assignments.map(serializeCouncilAssignment);
    const memberRows = buildCouncilMemberRows(members, serialized);
    const summary = summarizeCouncilBluebook(memberRows);

    return NextResponse.json({
      month,
      year,
      summary,
      members: memberRows,
      submissions: serialized,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load council bluebook overview." }, { status: 500 });
  }
}
