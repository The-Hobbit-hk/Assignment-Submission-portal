import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { assignmentInclude, isCitationEditable, serializeCitationAssignment } from "@/lib/citations";
import { canSubmitCitations } from "@/lib/roles";
import { saveUpload } from "@/lib/upload";
import { apiError, forbidden, notFound, handleRouteError } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const role = session!.user.role as UserRole;
  if (!canSubmitCitations(role)) {
    return forbidden();
  }

  try {
    const assignment = await prisma.citationAssignment.findUnique({
      where: { id },
      include: assignmentInclude,
    });
    if (!assignment) return notFound("Citation assignment not found.");
    if (session!.user.clubId !== assignment.clubId) {
      return forbidden();
    }
    if (assignment.status === "APPROVED") {
      return apiError("Approved citations cannot be edited.", 400);
    }
    if (!isCitationEditable(assignment.status, assignment.dueDate)) {
      return apiError("This citation is past its deadline and can no longer be updated.", 400);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file.", 400);

    const proofUrl = await saveUpload(file, "citations/proofs");
    const status =
      assignment.status === "ASSIGNED" || assignment.status === "REJECTED"
        ? "DRAFT"
        : assignment.status;

    const updated = await prisma.citationAssignment.update({
      where: { id },
      data: { proofUrl, status },
      include: assignmentInclude,
    });

    return NextResponse.json(serializeCitationAssignment(updated));
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
