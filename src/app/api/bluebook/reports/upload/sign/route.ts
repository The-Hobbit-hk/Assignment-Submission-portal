import { NextResponse } from "next/server";
import {
  apiError,
  assertBluebookReportUploadable,
  buildBluebookObjectPath,
  handleRouteError,
  isAllowedBluebookFile,
  MAX_BLUEBOOK_UPLOAD_BYTES,
  MAX_BLUEBOOK_UPLOAD_LABEL,
  requireBluebookUploader,
} from "@/lib/bluebook-report-upload";
import { isR2Ready, signPublicUpload } from "@/lib/storage/r2-ops";

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
    if (!isR2Ready()) {
      return apiError(
        "Direct uploads require file storage. Contact an administrator.",
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

    const objectPath = buildBluebookObjectPath(session!.user.id, fileName, contentType);
    const signed = await signPublicUpload(objectPath, contentType);

    return NextResponse.json(signed);
  } catch (e) {
    return handleRouteError(e, "Could not prepare upload.");
  }
}
