import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEventRecord } from "@/lib/club-access";
import { saveUpload } from "@/lib/upload";
import { MAX_EVENT_FILE_UPLOAD_BYTES } from "@/lib/event-file-upload";
import { handleRouteError, apiError, forbidden, notFound } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || undefined;
    if (!file) return apiError("No file.", 400);

    const url = await saveUpload(file, "events/gallery", MAX_EVENT_FILE_UPLOAD_BYTES);
    const count = await prisma.eventGallery.count({ where: { eventId: id } });
    const image = await prisma.eventGallery.create({
      data: { eventId: id, url, caption, sortOrder: count },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
