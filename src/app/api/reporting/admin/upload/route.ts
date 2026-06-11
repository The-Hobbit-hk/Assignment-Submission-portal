import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMonthlyReport } from "@/lib/reporting";
import { assertClubReportingAccess, resolveReportingClubId } from "@/lib/reporting-access";
import { upsertMonthlyReport } from "@/lib/reporting-store";
import { saveUpload } from "@/lib/upload";

const fieldSchema = z.enum(["resolution", "districtDues", "bylaws"]);

const MAX_BYTES: Record<string, number> = {
  resolution: 5 * 1024 * 1024,
  districtDues: 5 * 1024 * 1024,
  bylaws: 5 * 1024 * 1024,
};

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const field = fieldSchema.parse(formData.get("field"));
    const month = parseInt(String(formData.get("month")));
    const year = parseInt(String(formData.get("year")));
    const clubIdParam = formData.get("clubId");

    if (!file?.size) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const access = await assertClubReportingAccess(session!, month, year);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const clubId = resolveReportingClubId(
      session!,
      clubIdParam ? String(clubIdParam) : null
    );
    const url = await saveUpload(file, "admin-reporting", MAX_BYTES[field]);

    const fileUpdate =
      field === "resolution"
        ? { resolutionFileUrl: url }
        : field === "districtDues"
          ? { districtDuesFileUrl: url }
          : { bylawsFileUrl: url };

    const report = await upsertMonthlyReport(
      prisma,
      "ADMIN",
      { month, year, clubId },
      {
        submittedBy: { connect: { id: session!.user.id } },
        ...fileUpdate,
        ...(clubId ? { club: { connect: { id: clubId } } } : {}),
      }
    );

    return NextResponse.json(serializeMonthlyReport(report));
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
