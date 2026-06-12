import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { getOrCreateCycle, serializeCycle, serializeReport } from "@/lib/bluebook-cycle";
import { taskStatusLabel } from "@/lib/bluebook-labels";
import { COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, DISTRICT_ROLES } from "@/lib/roles";

export async function GET(request: Request) {
  const { session, error } = await requireRole([
    ...COUNCIL_BLUEBOOK_PARTICIPANT_ROLES,
    ...DISTRICT_ROLES,
  ]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);

  try {
    const cycle = await getOrCreateCycle(prisma, month, year);

    const [assignments, report] = await Promise.all([
      prisma.councilBluebookAssignment.findMany({
        where: { assigneeId: session!.user.id, task: { month, year } },
        include: {
          task: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { task: { dueDate: "asc" } },
      }),
      prisma.councilBluebookReport.findUnique({
        where: {
          cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id },
        },
        include: { cycle: true },
      }),
    ]);

    const serialized = assignments.map(serializeCouncilAssignment);
    const totalPossiblePoints = serialized.reduce((s, a) => s + (a.task?.maxScore ?? 0), 0);
    const totalAwardedPoints = serialized.reduce((s, a) => s + a.allocatedScore, 0);
    const cycleData = serializeCycle(cycle);
    const reportData = report ? serializeReport(report) : null;
    const isLocked = reportData != null && reportData.status !== "DRAFT";

    return NextResponse.json({
      month,
      year,
      cycle: cycleData,
      report: reportData,
      assignments: serialized.map((a) => ({
        ...a,
        statusLabel: taskStatusLabel(a.status),
      })),
      stats: {
        totalTasks: serialized.length,
        totalPossiblePoints,
        totalAwardedPoints,
        submissionDeadline: cycleData.closesAt,
        submissionOpen: cycleData.isOpen && !isLocked,
        submissionClosed: !cycleData.isOpen || isLocked,
        submissionStatus: reportData?.status ?? "DRAFT",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}
