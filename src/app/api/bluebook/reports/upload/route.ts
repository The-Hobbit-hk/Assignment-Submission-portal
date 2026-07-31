import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import { isAllowedBluebookFile, isCycleOpen, MAX_BLUEBOOK_UPLOAD_BYTES } from "@/lib/bluebook-labels";
import { saveUpload } from "@/lib/upload";
import { COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, DISTRICT_ROLES } from "@/lib/roles";
import { isSubmissionWindowsBypassEnabled } from "@/lib/submission-windows";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";

export async function POST(request: Request) {
  const { session, error } = await requireRole([
    ...COUNCIL_BLUEBOOK_PARTICIPANT_ROLES,
    ...DISTRICT_ROLES,
  ]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "0", 10);
  const year = parseInt(searchParams.get("year") ?? "0", 10);
  if (!month || !year) {
    return apiError("month and year are required.", 400);
  }

  try {
    const cycle = await getOrCreateCycle(prisma, month, year);

    if (
      !isSubmissionWindowsBypassEnabled() &&
      (!cycle.isActive || !isCycleOpen(cycle.closesAt, cycle.opensAt))
    ) {
      return forbidden(
        "Submission window is closed. Blue Book submissions are only accepted until the last day of the month."
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiError("No file provided.", 400);
    }
    if (!isAllowedBluebookFile(file)) {
      return apiError("Allowed formats: PDF, DOCX, JPG, PNG.", 400);
    }

    const existing = await prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id } },
    });

    if (existing && existing.status !== "DRAFT") {
      return forbidden("Submission is locked. Contact the District Secretary to reopen.");
    }

    const url = await saveUpload(file, "bluebook-reports", MAX_BLUEBOOK_UPLOAD_BYTES);

    const proofUrls = [...((existing?.proofUrls as string[] | null) ?? []), url];

    const report = await prisma.councilBluebookReport.upsert({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id } },
      create: {
        cycleId: cycle.id,
        assigneeId: session!.user.id,
        proofUrls,
        status: "DRAFT",
      },
      update: { proofUrls },
      include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(serializeReport(report));
  } catch (e) {
    return handleRouteError(e, "Upload failed.");
  }
}
