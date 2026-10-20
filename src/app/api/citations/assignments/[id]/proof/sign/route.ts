import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertCitationProofUploadable,
  buildCitationProofObjectPath,
  isAllowedCitationProofFile,
  MAX_CITATION_PROOF_BYTES,
  MAX_CITATION_PROOF_LABEL,
} from "@/lib/citation-proof-upload";
import { isR2Ready, signPublicUpload } from "@/lib/storage/r2-ops";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  size: z.number().positive(),
});

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

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

    if (!isAllowedCitationProofFile({ name: body.fileName, type: contentType })) {
      return apiError("Allowed formats: PDF, JPG, PNG, WebP.", 400);
    }
    if (body.size > MAX_CITATION_PROOF_BYTES) {
      return apiError(`File exceeds maximum size of ${MAX_CITATION_PROOF_LABEL}.`, 413);
    }

    const gate = await assertCitationProofUploadable(session!, id);
    if (!gate.ok) return gate.response;

    const objectPath = buildCitationProofObjectPath(
      session!.user.id,
      id,
      body.fileName,
      contentType
    );
    const signed = await signPublicUpload(objectPath, contentType);

    return NextResponse.json(signed);
  } catch (err) {
    return handleRouteError(err, "Could not prepare upload.");
  }
}
