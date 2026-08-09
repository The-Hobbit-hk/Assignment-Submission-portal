import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertReportingEventUploadable,
  buildReportingEventObjectPath,
  getSupabaseAdmin,
  isAllowedReportingEventFile,
  isSupabaseStorageEnabled,
  MAX_REPORTING_EVENT_UPLOAD_BYTES,
  MAX_REPORTING_EVENT_UPLOAD_LABEL,
  REPORTING_EVENT_UPLOAD_KINDS,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/reporting-event-upload";

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
    if (!isSupabaseStorageEnabled()) {
      return apiError(
        "Direct uploads require Supabase Storage. Contact an administrator.",
        500
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

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return apiError("Supabase Storage is not configured.", 500);
    }

    const objectPath = buildReportingEventObjectPath(
      session!.user.id,
      body.kind,
      body.fileName,
      contentType
    );
    const { data, error: signError } = await supabase.storage
      .from(SUPABASE_UPLOAD_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (signError || !data) {
      return apiError(signError?.message ?? "Could not create upload URL.", 500);
    }

    const { data: publicData } = supabase.storage
      .from(SUPABASE_UPLOAD_BUCKET)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
      kind: body.kind,
    });
  } catch (err) {
    return handleRouteError(err, "Could not prepare upload.");
  }
}
