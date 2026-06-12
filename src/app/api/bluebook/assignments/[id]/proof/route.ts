import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";

export async function POST(
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

    if (!assignment || assignment.assigneeId !== session!.user.id) {
      return forbidden();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiError("No file provided.", 400);
    }

    const url = await saveUpload(file, "bluebook-proof");
    const updated = await prisma.councilBluebookAssignment.update({
      where: { id },
      data: { proofUrl: url },
      include: { task: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(serializeCouncilAssignment(updated));
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
