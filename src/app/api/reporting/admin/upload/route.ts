import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMonthlyReport } from "@/lib/reporting";
import { assertClubReportingAccess, requireReportingClubId } from "@/lib/reporting-access";
import { upsertMonthlyReport } from "@/lib/reporting-store";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError } from "@/lib/api-errors";

const fieldSchema = z.enum(["resolution", "districtDues", "bylaws", "masterBudget"]);

const MAX_BYTES: Record<string, number> = {
  resolution: 5 * 1024 * 1024,
  districtDues: 5 * 1024 * 1024,
  bylaws: 5 * 1024 * 1024,
  masterBudget: 5 * 1024 * 1024,
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
      return apiError("No file provided.", 400);
    }

    const access = await assertClubReportingAccess(session!, month, year);
    if (!access.ok) {
      return apiError(access.error, access.status);
    }

    const clubResolved = await requireReportingClubId(
      session!,
      clubIdParam ? String(clubIdParam) : null
    );
    if (!clubResolved.ok) {
      return apiError(clubResolved.error, clubResolved.status);
    }
    const clubId = clubResolved.clubId;
    const url = await saveUpload(file, "admin-reporting", MAX_BYTES[field]);

    const fileUpdate =
      field === "resolution"
        ? { resolutionFileUrl: url }
        : field === "districtDues"
          ? { districtDuesFileUrl: url }
          : field === "bylaws"
            ? { bylawsFileUrl: url }
            : { masterBudgetFileUrl: url };

    const report = await upsertMonthlyReport(
      prisma,
      "ADMIN",
      { month, year, clubId },
      {
        submittedBy: { connect: { id: session!.user.id } },
        ...fileUpdate,
      }
    );

    return NextResponse.json(serializeMonthlyReport(report));
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
