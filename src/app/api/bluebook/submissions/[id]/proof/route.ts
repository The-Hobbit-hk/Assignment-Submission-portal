import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const existing = await prisma.bluebookSubmission.findUnique({
      where: { id },
      select: { clubId: true },
    });
    if (!existing) return notFound("Submission not found.");

    if (
      !canAccessClubRecord(
        { role: session!.user.role as UserRole, clubId: session!.user.clubId },
        existing.clubId
      )
    ) {
      return forbidden();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file.", 400);

    const url = await saveUpload(file, "bluebook/proofs");
    const submission = await prisma.bluebookSubmission.update({
      where: { id },
      data: { proofUrl: url },
    });
    return NextResponse.json({ proofUrl: submission.proofUrl });
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
