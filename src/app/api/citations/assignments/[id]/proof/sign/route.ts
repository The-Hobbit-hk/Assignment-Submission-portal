import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertCitationProofUploadable,
  buildCitationProofObjectPath,
  getSupabaseAdmin,
  isAllowedCitationProofFile,
  isSupabaseStorageEnabled,
  MAX_CITATION_PROOF_BYTES,
  MAX_CITATION_PROOF_LABEL,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/citation-proof-upload";

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
    if (!isSupabaseStorageEnabled()) {
      return apiError(
        "Direct uploads require Supabase Storage. Contact an administrator.",
        500
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

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return apiError("Supabase Storage is not configured.", 500);
    }

    const objectPath = buildCitationProofObjectPath(
      session!.user.id,
      id,
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
    });
  } catch (err) {
    return handleRouteError(err, "Could not prepare upload.");
  }
}
