import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";
import {
  apiError,
  assertBluebookReportUploadable,
  attachBluebookProofUrl,
  handleRouteError,
  isAllowedBluebookFile,
  isSupabaseStorageEnabled,
  MAX_BLUEBOOK_UPLOAD_BYTES,
  requireBluebookUploader,
  serializeReport,
} from "@/lib/bluebook-report-upload";

/**
 * Legacy multipart upload (local / small files).
 * Production clients should use /sign + direct Supabase upload + /complete
 * so files can be up to 10 MB without hitting Vercel's ~4.5 MB body limit.
 */
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
    const gate = await assertBluebookReportUploadable(session!, month, year);
    if (!gate.ok) return gate.response;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiError("No file provided.", 400);
    }
    if (!isAllowedBluebookFile(file)) {
      return apiError("Allowed formats: PDF, DOCX, JPG, PNG.", 400);
    }

    const url = await saveUpload(file, "bluebook-reports", MAX_BLUEBOOK_UPLOAD_BYTES);

    const report = await attachBluebookProofUrl(
      gate.cycleId,
      session!.user.id,
      url,
      gate.existingProofUrls
    );

    return NextResponse.json(serializeReport(report));
  } catch (e) {
    // If multipart hits the platform body limit, steer clients to signed uploads.
    if (isSupabaseStorageEnabled()) {
      return apiError(
        "File is too large for direct server upload. Please retry — the app will use a secure large-file upload.",
        413
      );
    }
    return handleRouteError(e, "Upload failed.");
  }
}
