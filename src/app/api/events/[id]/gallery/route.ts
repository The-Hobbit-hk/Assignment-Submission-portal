import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEvents } from "@/lib/roles";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!canManageEvents(session!.user.role as UserRole)) return forbidden();
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || undefined;
    if (!file) return apiError("No file.", 400);

    const url = await saveUpload(file, "events/gallery");
    const count = await prisma.eventGallery.count({ where: { eventId: id } });
    const image = await prisma.eventGallery.create({
      data: { eventId: id, url, caption, sortOrder: count },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
