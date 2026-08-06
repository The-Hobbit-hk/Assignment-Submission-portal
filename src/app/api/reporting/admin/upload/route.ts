import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  ADMIN_REPORT_FIELDS,
  attachAdminReportFileUrl,
  isAllowedAdminReportFile,
  MAX_ADMIN_REPORT_UPLOAD_BYTES,
  MAX_ADMIN_REPORT_UPLOAD_LABEL,
  resolveAdminReportUploadContext,
} from "@/lib/admin-report-upload";

const fieldSchema = z.enum(ADMIN_REPORT_FIELDS);

/**
 * Multipart upload fallback for smaller files / local dev.
 * Prefer /upload/sign + direct storage PUT for files near the 5 MB limit,
 * because Vercel's request body cap is ~4.5 MB.
 */
export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const field = fieldSchema.parse(formData.get("field"));
    const month = parseInt(String(formData.get("month")), 10);
    const year = parseInt(String(formData.get("year")), 10);
    const clubIdParam = formData.get("clubId");

    if (!file?.size) {
      return apiError("No file provided.", 400);
    }
    if (!isAllowedAdminReportFile(file)) {
      return apiError("Allowed formats: PDF, JPG, PNG, WebP.", 400);
    }
    if (file.size > MAX_ADMIN_REPORT_UPLOAD_BYTES) {
      return apiError(
        `File exceeds maximum size of ${MAX_ADMIN_REPORT_UPLOAD_LABEL}.`,
        413
      );
    }

    const ctx = await resolveAdminReportUploadContext(
      session!,
      month,
      year,
      clubIdParam ? String(clubIdParam) : null
    );
    if (!ctx.ok) return ctx.response;

    const url = await saveUpload(file, "admin-reporting", MAX_ADMIN_REPORT_UPLOAD_BYTES);
    const report = await attachAdminReportFileUrl(
      session!,
      month,
      year,
      ctx.clubId,
      field,
      url
    );

    return NextResponse.json(report);
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
