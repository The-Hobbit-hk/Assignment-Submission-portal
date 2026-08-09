import { NextResponse } from "next/server";
import {
  apiError,
  assertBluebookReportUploadable,
  buildBluebookObjectPath,
  getSupabaseAdmin,
  handleRouteError,
  isAllowedBluebookFile,
  isSupabaseStorageEnabled,
  MAX_BLUEBOOK_UPLOAD_BYTES,
  MAX_BLUEBOOK_UPLOAD_LABEL,
  requireBluebookUploader,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/bluebook-report-upload";

export async function POST(request: Request) {
  const { session, error } = await requireBluebookUploader();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "0", 10);
  const year = parseInt(searchParams.get("year") ?? "0", 10);
  if (!month || !year) {
    return apiError("month and year are required.", 400);
  }

  try {
    if (!isSupabaseStorageEnabled()) {
      return apiError(
        "Direct uploads require Supabase Storage. Contact an administrator.",
        503,
        { code: "STORAGE_NOT_CONFIGURED" }
      );
    }

    const body = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      size?: number;
    };

    const fileName = body.fileName?.trim() ?? "";
    const contentType = body.contentType?.trim() || "application/octet-stream";
    const size = typeof body.size === "number" ? body.size : 0;

    if (!fileName) return apiError("fileName is required.", 400);
    if (!isAllowedBluebookFile({ name: fileName, type: contentType })) {
      return apiError("Allowed formats: PDF, DOCX, JPG, PNG.", 400);
    }
    if (size <= 0) return apiError("Invalid file size.", 400);
    if (size > MAX_BLUEBOOK_UPLOAD_BYTES) {
      return apiError(`File exceeds maximum size of ${MAX_BLUEBOOK_UPLOAD_LABEL}.`, 413);
    }

    const gate = await assertBluebookReportUploadable(session!, month, year);
    if (!gate.ok) return gate.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return apiError("Supabase Storage is not configured.", 503, {
        code: "STORAGE_NOT_CONFIGURED",
      });
    }

    // Raise bucket limit if it was created with the older 8 MB cap.
    try {
      await supabase.storage.updateBucket(SUPABASE_UPLOAD_BUCKET, {
        public: true,
        fileSizeLimit: MAX_BLUEBOOK_UPLOAD_BYTES,
      });
    } catch {
      // Non-fatal — bucket may already allow 10 MB.
    }

    const objectPath = buildBluebookObjectPath(session!.user.id, fileName, contentType);
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
    });
  } catch (e) {
    return handleRouteError(e, "Could not prepare upload.");
  }
}
