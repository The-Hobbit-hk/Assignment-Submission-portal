import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  ADMIN_REPORT_FIELDS,
  buildAdminReportObjectPath,
  isAllowedAdminReportFile,
  MAX_ADMIN_REPORT_UPLOAD_BYTES,
  MAX_ADMIN_REPORT_UPLOAD_LABEL,
  resolveAdminReportUploadContext,
} from "@/lib/admin-report-upload";
import { isR2Ready, signPublicUpload } from "@/lib/storage/r2-ops";

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  size: z.number().positive(),
  field: z.enum(ADMIN_REPORT_FIELDS),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  clubId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!isR2Ready()) {
      return apiError(
        "Direct uploads require file storage. Contact an administrator.",
        503,
        { code: "STORAGE_NOT_CONFIGURED" }
      );
    }

    const body = bodySchema.parse(await request.json());
    const contentType = body.contentType?.trim() || "application/octet-stream";

    if (!isAllowedAdminReportFile({ name: body.fileName, type: contentType })) {
      return apiError("Allowed formats: PDF, JPG, PNG, WebP.", 400);
    }
    if (body.size > MAX_ADMIN_REPORT_UPLOAD_BYTES) {
      return apiError(
        `File exceeds maximum size of ${MAX_ADMIN_REPORT_UPLOAD_LABEL}.`,
        413
      );
    }

    const ctx = await resolveAdminReportUploadContext(
      session!,
      body.month,
      body.year,
      body.clubId ?? null
    );
    if (!ctx.ok) return ctx.response;

    const objectPath = buildAdminReportObjectPath(
      session!.user.id,
      body.fileName,
      contentType
    );
    const signed = await signPublicUpload(objectPath, contentType);

    return NextResponse.json({
      ...signed,
      field: body.field,
      clubId: ctx.clubId,
    });
  } catch (err) {
    return handleRouteError(err, "Could not prepare upload.");
  }
}
