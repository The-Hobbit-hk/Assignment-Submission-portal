import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  assignmentInclude,
  serializeCitationAssignment,
} from "@/lib/citations";
import { canSubmitCitations, DISTRICT_ROLES } from "@/lib/roles";
import { updateCitationAssignmentSchema } from "@/lib/validators/citations";
import { apiError, forbidden, notFound, validationError, handleRouteError } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getAssignmentOr404(id: string) {
  return prisma.citationAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
}

function canAccessAssignment(
  role: UserRole,
  clubId: string | null | undefined,
  assignmentClubId: string
) {
  if (DISTRICT_ROLES.includes(role)) return true;
  if (canSubmitCitations(role) && clubId === assignmentClubId) return true;
  return false;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const assignment = await getAssignmentOr404(id);
    if (!assignment) return notFound("Citation assignment not found.");

    const role = session!.user.role as UserRole;
    if (!canAccessAssignment(role, session!.user.clubId, assignment.clubId)) {
      return forbidden();
    }

    return NextResponse.json(serializeCitationAssignment(assignment));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch citation assignment.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const role = session!.user.role as UserRole;
  if (!canSubmitCitations(role)) {
    return forbidden();
  }

  try {
    const assignment = await getAssignmentOr404(id);
    if (!assignment) return notFound("Citation assignment not found.");
    if (session!.user.clubId !== assignment.clubId) {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateCitationAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    if (assignment.status === "APPROVED") {
      return apiError("Approved citations cannot be edited.", 400);
    }

    const data: {
      clubNotes?: string;
      status?: "DRAFT" | "SUBMITTED" | "ASSIGNED";
      submittedAt?: Date | null;
    } = {};

    if (parsed.data.clubNotes !== undefined) {
      data.clubNotes = parsed.data.clubNotes;
    }

    if (parsed.data.submit) {
      if (!assignment.proofUrl) {
        return apiError("Upload proof before submitting.", 400);
      }
      data.status = "SUBMITTED";
      data.submittedAt = new Date();
    } else if (parsed.data.saveDraft) {
      if (assignment.status === "REJECTED" || assignment.status === "ASSIGNED") {
        data.status = "DRAFT";
      }
    }

    const updated = await prisma.citationAssignment.update({
      where: { id },
      data,
      include: assignmentInclude,
    });

    return NextResponse.json(serializeCitationAssignment(updated));
  } catch (err) {
    return handleRouteError(err, "Failed to update citation assignment.");
  }
}
