import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { DISTRICT_ROLES, isDistrictSecretary } from "@/lib/roles";
import { handleRouteError, notFound, forbidden } from "@/lib/api-errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const assignment = await prisma.councilBluebookAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return notFound("Not found.");
    }

    const body = await request.json();
    const isOwner = assignment.assigneeId === session!.user.id;
    const isSecretary = isDistrictSecretary(session!.user.role);

    if (!isOwner && !DISTRICT_ROLES.includes(session!.user.role)) {
      return forbidden();
    }

    const isSubmit = body.submit === true;

    const updated = await prisma.councilBluebookAssignment.update({
      where: { id },
      data: {
        ...(isSecretary && body.allocatedScore != null
          ? { allocatedScore: body.allocatedScore }
          : {}),
        ...(isSecretary && body.reviewerComment != null
          ? { reviewerComment: body.reviewerComment, reviewedAt: new Date() }
          : {}),
        ...(isSecretary && body.status
          ? { status: body.status }
          : {}),
        ...(isSubmit && isOwner
          ? { status: "SUBMITTED", submittedAt: new Date() }
          : {}),
      },
      include: { task: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(serializeCouncilAssignment(updated));
  } catch (err) {
    return handleRouteError(err, "Failed to update.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { id } = await params;

  try {
    const assignment = await prisma.councilBluebookAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return notFound("Not found.");
    }

    await prisma.councilBluebookAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Assignment deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete assignment.");
  }
}
