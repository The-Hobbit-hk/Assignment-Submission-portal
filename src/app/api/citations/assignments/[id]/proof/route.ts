import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertCitationProofUploadable,
  attachCitationProofUrl,
  isAllowedCitationProofFile,
  MAX_CITATION_PROOF_BYTES,
  MAX_CITATION_PROOF_LABEL,
} from "@/lib/citation-proof-upload";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Multipart fallback for smaller files / local dev.
 * Prefer /proof/sign + direct storage PUT near the 5 MB limit.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const gate = await assertCitationProofUploadable(session!, id);
    if (!gate.ok) return gate.response;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file?.size) return apiError("No file.", 400);
    if (!isAllowedCitationProofFile(file)) {
      return apiError("Allowed formats: PDF, JPG, PNG, WebP.", 400);
    }
    if (file.size > MAX_CITATION_PROOF_BYTES) {
      return apiError(`File exceeds maximum size of ${MAX_CITATION_PROOF_LABEL}.`, 413);
    }

    const proofUrl = await saveUpload(file, "citations/proofs", MAX_CITATION_PROOF_BYTES);
    const updated = await attachCitationProofUrl(id, proofUrl);
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
