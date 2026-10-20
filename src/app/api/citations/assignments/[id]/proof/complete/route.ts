import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError, apiError } from "@/lib/api-errors";
import {
  assertCitationProofUploadable,
  attachCitationProofUrl,
  isOwnedCitationProofPath,
} from "@/lib/citation-proof-upload";
import { publicFileUrl } from "@/lib/storage/public-url";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  path: z.string().min(1),
});

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const body = bodySchema.parse(await request.json());
    if (!isOwnedCitationProofPath(session!.user.id, id, body.path)) {
      return apiError("Invalid upload path.", 400);
    }

    const gate = await assertCitationProofUploadable(session!, id);
    if (!gate.ok) return gate.response;

    const updated = await attachCitationProofUrl(id, publicFileUrl(body.path));
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, "Could not attach uploaded file.");
  }
}
