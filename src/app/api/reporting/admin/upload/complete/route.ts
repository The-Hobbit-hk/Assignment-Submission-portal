import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  ADMIN_REPORT_FIELDS,
  attachAdminReportFileUrl,
  isOwnedAdminReportObjectPath,
  resolveAdminReportUploadContext,
} from "@/lib/admin-report-upload";
import { publicFileUrl } from "@/lib/storage/public-url";

const bodySchema = z.object({
  path: z.string().min(1),
  field: z.enum(ADMIN_REPORT_FIELDS),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  clubId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = bodySchema.parse(await request.json());
    if (!isOwnedAdminReportObjectPath(session!.user.id, body.path)) {
      return apiError("Invalid upload path.", 400);
    }

    const ctx = await resolveAdminReportUploadContext(
      session!,
      body.month,
      body.year,
      body.clubId ?? null
    );
    if (!ctx.ok) return ctx.response;

    const report = await attachAdminReportFileUrl(
      session!,
      body.month,
      body.year,
      ctx.clubId,
      body.field,
      publicFileUrl(body.path)
    );

    return NextResponse.json(report);
  } catch (err) {
    return handleRouteError(err, "Could not attach uploaded file.");
  }
}
