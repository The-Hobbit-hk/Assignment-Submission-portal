import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { getOrCreateCycle, serializeCycle, serializeReport } from "@/lib/bluebook-cycle";
import { memberTaskOutcomeLabel, taskStatusLabel } from "@/lib/bluebook-labels";
import { COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, DISTRICT_ROLES } from "@/lib/roles";
import { isSubmissionWindowsBypassEnabled } from "@/lib/submission-windows";
import { handleRouteError } from "@/lib/api-errors";

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
    const tasksCompleted = serialized.filter((a) => a.status === "APPROVED").length;
    const tasksIncomplete = serialized.filter((a) => a.status === "REJECTED").length;
    const tasksUnderReview = serialized.filter((a) => a.status === "SUBMITTED").length;
    const tasksPending = serialized.filter(
      (a) => a.status === "DRAFT" || a.status === "EXPIRED"
    ).length;
    const reviewedCount = tasksCompleted + tasksIncomplete;
    const reviewDone =
      report?.status === "APPROVED" ||
      (serialized.length > 0 && reviewedCount === serialized.length);
    const completionPercent =
      serialized.length === 0
        ? null
        : Math.round((tasksCompleted / serialized.length) * 100);
    const cycleData = serializeCycle(cycle);
    const reportData = report ? serializeReport(report) : null;
    const isLocked = reportData != null && reportData.status !== "DRAFT";
    const windowOpen =
      isSubmissionWindowsBypassEnabled() || cycleData.isOpen;

    return NextResponse.json({
      month,
      year,
      cycle: cycleData,
      report: reportData,
      assignments: serialized.map((a) => ({
        ...a,
        statusLabel: taskStatusLabel(a.status),
        outcomeLabel: memberTaskOutcomeLabel(a.status),
      })),
      stats: {
        totalTasks: serialized.length,
        tasksCompleted,
        tasksIncomplete,
        tasksUnderReview,
        tasksPending,
        reviewedCount,
        reviewDone,
        completionPercent,
        // Legacy aliases
        totalPossiblePoints: serialized.length,
        totalAwardedPoints: tasksCompleted,
        submissionDeadline: cycleData.closesAt,
        submissionOpen: windowOpen && !isLocked,
        submissionClosed: !windowOpen || isLocked,
        testingMode: isSubmissionWindowsBypassEnabled(),
        submissionStatus: reportData?.status ?? "DRAFT",
      },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to fetch tasks.");
  }
}
