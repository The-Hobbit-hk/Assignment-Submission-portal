import { NextResponse } from "next/server";
import {
  apiError,
  assertBluebookReportUploadable,
  attachBluebookProofUrl,
  handleRouteError,
  isOwnedBluebookObjectPath,
  requireBluebookUploader,
  serializeReport,
} from "@/lib/bluebook-report-upload";
import { publicFileUrl } from "@/lib/storage/public-url";

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
    const body = (await request.json()) as { path?: string };
    const objectPath = body.path?.trim() ?? "";
    if (!isOwnedBluebookObjectPath(session!.user.id, objectPath)) {
      return apiError("Invalid upload path.", 400);
    }

    const gate = await assertBluebookReportUploadable(session!, month, year);
    if (!gate.ok) return gate.response;

    const report = await attachBluebookProofUrl(
      gate.cycleId,
      session!.user.id,
      publicFileUrl(objectPath),
      gate.existingProofUrls
    );

    return NextResponse.json(serializeReport(report));
  } catch (e) {
    return handleRouteError(e, "Could not attach uploaded file.");
  }
}
