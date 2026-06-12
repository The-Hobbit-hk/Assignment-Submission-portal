import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { assignmentInclude, serializeCitationAssignment } from "@/lib/citations";
import { DISTRICT_ROLES } from "@/lib/roles";
import { reviewCitationSchema } from "@/lib/validators/citations";
import { apiError, notFound, validationError, handleRouteError } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = reviewCitationSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.citationAssignment.findUnique({
      where: { id },
      include: { definition: true },
    });
    if (!existing) return notFound("Citation assignment not found.");
    if (existing.status !== "SUBMITTED") {
      return apiError("Only submitted citations can be reviewed.", 400);
    }

    const awardedPoints =
      parsed.data.status === "APPROVED" ? existing.definition.points : 0;

    const updated = await prisma.citationAssignment.update({
      where: { id },
      data: {
        status: parsed.data.status,
        reviewerComment: parsed.data.reviewerComment ?? null,
        reviewedAt: new Date(),
        reviewedById: session!.user.id,
        awardedPoints,
      },
      include: assignmentInclude,
    });

    return NextResponse.json(serializeCitationAssignment(updated));
  } catch (err) {
    return handleRouteError(err, "Review failed.");
  }
}
