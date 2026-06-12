import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { getOrCreateCycle } from "@/lib/bluebook-cycle";
import {
  buildCouncilMemberRows,
  matchesReviewStatusFilter,
  summarizeCouncilBluebook,
} from "@/lib/council-bluebook-status";
import { fetchAssignableCouncilMembers } from "@/lib/council-assignees";
import { canViewCouncilBluebookOverview } from "@/lib/roles";
import { handleRouteError, forbidden } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canViewCouncilBluebookOverview(session!.user.role)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);
  const statusFilter = searchParams.get("status");
  const memberId = searchParams.get("memberId");
  const category = searchParams.get("category");
  const reviewStatus = searchParams.get("reviewStatus");

  try {
    const cycle = await getOrCreateCycle(prisma, month, year);

    const assignmentWhere = {
      task: {
        month,
        year,
        ...(category ? { category } : {}),
      },
      ...(memberId ? { assigneeId: memberId } : {}),
      ...(statusFilter ? { status: statusFilter as "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED" } : {}),
    };

    const [members, assignments, reports] = await Promise.all([
      fetchAssignableCouncilMembers(prisma),
      prisma.councilBluebookAssignment.findMany({
        where: assignmentWhere,
        include: {
          task: true,
          assignee: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ assignee: { name: "asc" } }, { task: { dueDate: "asc" } }],
      }),
      prisma.councilBluebookReport.findMany({
        where: { cycleId: cycle.id },
        select: { assigneeId: true, status: true, submittedAt: true },
      }),
    ]);

    const reportsByAssignee = Object.fromEntries(
      reports.map((r) => [r.assigneeId, { status: r.status }])
    );

    const serialized = assignments.map(serializeCouncilAssignment);
    let memberRows = buildCouncilMemberRows(members, serialized, reportsByAssignee);

    if (statusFilter) {
      memberRows = memberRows.filter((row) =>
        row.assignments.some((a) => a.status === statusFilter)
      );
    }
    if (memberId) {
      memberRows = memberRows.filter((row) => row.member.id === memberId);
    }
    if (reviewStatus) {
      memberRows = memberRows.filter((row) => matchesReviewStatusFilter(row, reviewStatus));
    }

    const summary = summarizeCouncilBluebook(memberRows, reports, cycle.closesAt);

    return NextResponse.json({
      month,
      year,
      cycle: {
        id: cycle.id,
        title: cycle.title,
        closesAt: cycle.closesAt.toISOString(),
        opensAt: cycle.opensAt.toISOString(),
      },
      summary,
      members: memberRows,
      submissions: serialized,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load council bluebook overview.");
  }
}
