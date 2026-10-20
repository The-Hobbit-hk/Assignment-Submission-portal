import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEventRecord } from "@/lib/club-access";
import { handleRouteError, apiError, forbidden, notFound } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";
import {
  EVENT_FILE_KINDS,
  buildEventFileObjectPath,
  isAllowedEventFile,
  MAX_EVENT_FILE_UPLOAD_BYTES,
  MAX_EVENT_FILE_UPLOAD_LABEL,
} from "@/lib/event-file-upload";
import { isR2Ready, signPublicUpload } from "@/lib/storage/r2-ops";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  size: z.number().positive(),
  kind: z.enum(EVENT_FILE_KINDS),
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

    const existing = await prisma.event.findUnique({
      where: { id },
      select: { id: true, clubId: true },
    });
    if (!existing) return notFound("Not found.");
    if (
      !canManageEventRecord(
        { role: session!.user.role as UserRole, clubId: session!.user.clubId },
        existing.clubId
      )
    ) {
      return forbidden();
    }

    const body = bodySchema.parse(await request.json());
    const contentType = body.contentType?.trim() || "application/octet-stream";

    if (!isAllowedEventFile({ name: body.fileName, type: contentType }, body.kind)) {
      return apiError(
        body.kind === "minutes"
          ? "Minutes must be a PDF."
          : "Allowed image formats: JPG, PNG, WebP.",
        400
      );
    }
    if (body.size > MAX_EVENT_FILE_UPLOAD_BYTES) {
      return apiError(
        `File exceeds maximum size of ${MAX_EVENT_FILE_UPLOAD_LABEL}.`,
        413
      );
    }

    const objectPath = buildEventFileObjectPath(
      session!.user.id,
      id,
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
