import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEventRecord } from "@/lib/club-access";
import { handleRouteError, apiError, forbidden, notFound } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";
import {
  EVENT_FILE_KINDS,
  isOwnedEventFilePath,
  publicUrlForEventPath,
} from "@/lib/event-file-upload";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  path: z.string().min(1).max(400),
  kind: z.enum(EVENT_FILE_KINDS),
  caption: z.string().max(500).optional(),
});

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

    const body = bodySchema.parse(await request.json());
    if (!isOwnedEventFilePath(session!.user.id, id, body.kind, body.path)) {
      return apiError("Invalid upload path.", 400);
    }

    const url = publicUrlForEventPath(body.path);
    if (!url) {
      return apiError("Could not resolve uploaded file.", 500);
    }

    if (body.kind === "minutes") {
      const event = await prisma.event.update({
        where: { id },
        data: { minutesPdfUrl: url },
      });
      return NextResponse.json({ minutesPdfUrl: event.minutesPdfUrl });
    }

    if (body.kind === "banner") {
      const event = await prisma.event.update({
        where: { id },
        data: { bannerUrl: url },
      });
      return NextResponse.json({ bannerUrl: event.bannerUrl });
    }

    const count = await prisma.eventGallery.count({ where: { eventId: id } });
    const image = await prisma.eventGallery.create({
      data: {
        eventId: id,
        url,
        caption: body.caption,
        sortOrder: count,
      },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Could not attach uploaded file.");
  }
}
