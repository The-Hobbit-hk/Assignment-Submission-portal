import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import { isAllowedBluebookFile } from "@/lib/bluebook-labels";
import { saveUpload } from "@/lib/upload";
import { COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, DISTRICT_ROLES } from "@/lib/roles";

const MAX_BLUEBOOK_BYTES = 8 * 1024 * 1024;

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
    return NextResponse.json({ error: "month and year are required." }, { status: 400 });
  }

  try {
    const cycle = await getOrCreateCycle(prisma, month, year);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!isAllowedBluebookFile(file)) {
      return NextResponse.json(
        { error: "Allowed formats: PDF, DOCX, JPG, PNG." },
        { status: 400 }
      );
    }

    const existing = await prisma.councilBluebookReport.findUnique({
      where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session!.user.id } },
    });

    if (existing && existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Submission is locked. Contact the District Secretary to reopen." },
        { status: 403 }
      );
    }

    const url = await saveUpload(file, "bluebook-reports", MAX_BLUEBOOK_BYTES);

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
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
