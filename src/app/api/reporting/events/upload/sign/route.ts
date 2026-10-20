import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertReportingEventUploadable,
  buildReportingEventObjectPath,
  isAllowedReportingEventFile,
  MAX_REPORTING_EVENT_UPLOAD_BYTES,
  MAX_REPORTING_EVENT_UPLOAD_LABEL,
  REPORTING_EVENT_UPLOAD_KINDS,
} from "@/lib/reporting-event-upload";
import { isR2Ready, signPublicUpload } from "@/lib/storage/r2-ops";

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  size: z.number().positive(),
  kind: z.enum(REPORTING_EVENT_UPLOAD_KINDS),
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

    if (!isAllowedReportingEventFile({ name: body.fileName, type: contentType }, body.kind)) {
      return apiError(
        body.kind === "minutes"
          ? "Minutes must be a PDF."
          : "Allowed image formats: JPG, PNG, WebP.",
        400
      );
    }
    if (body.size > MAX_REPORTING_EVENT_UPLOAD_BYTES) {
      return apiError(
        `File exceeds maximum size of ${MAX_REPORTING_EVENT_UPLOAD_LABEL}.`,
        413
      );
    }

    const gate = await assertReportingEventUploadable(session!, body.clubId ?? null);
    if (!gate.ok) return gate.response;

    const objectPath = buildReportingEventObjectPath(
      session!.user.id,
      body.kind,
      body.fileName,
      contentType
    );
    const signed = await signPublicUpload(objectPath, contentType);

    return NextResponse.json({
      ...signed,
      kind: body.kind,
    });
  } catch (err) {
    return handleRouteError(err, "Could not prepare upload.");
  }
}
