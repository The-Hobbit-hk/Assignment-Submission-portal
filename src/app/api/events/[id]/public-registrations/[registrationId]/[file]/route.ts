import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { readPrivateUpload } from "@/lib/upload";
import { handleRouteError, apiError, notFound } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string; registrationId: string; file: string }>;
}

const FILE_MAP = {
  "payment-proof": "paymentProofPath",
  "government-id": "governmentIdPath",
} as const;

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;

  const { id: eventId, registrationId, file } = await params;
  const field = FILE_MAP[file as keyof typeof FILE_MAP];
  if (!field) {
    return apiError("Invalid file type.", 400);
  }

  try {
    const registration = await prisma.publicEventRegistration.findFirst({
      where: { id: registrationId, eventId },
    });
    if (!registration) return notFound("Registration not found.");

    const storagePath = registration[field];
    const { buffer, contentType } = await readPrivateUpload(storagePath);
    const ext = storagePath.split(".").pop() ?? "bin";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${file}-${registrationId}.${ext}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return handleRouteError(err, "Could not load file.");
  }
}
