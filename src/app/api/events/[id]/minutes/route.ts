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
    if (!file) return apiError("No file.", 400);

    const url = await saveUpload(file, "events/minutes");
    const event = await prisma.event.update({
      where: { id },
      data: { minutesPdfUrl: url },
    });
    return NextResponse.json({ minutesPdfUrl: event.minutesPdfUrl });
  } catch (err) {
    return handleRouteError(err, "Upload failed.");
  }
}
