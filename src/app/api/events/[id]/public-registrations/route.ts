import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { handleRouteError, notFound } from "@/lib/api-errors";
import { serializePublicRegistration } from "@/lib/public-event-registration";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;

  const { id: eventId } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });
    if (!event) return notFound("Event not found.");

    const registrations = await prisma.publicEventRegistration.findMany({
      where: { eventId },
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({
      event,
      registrations: registrations.map(serializePublicRegistration),
      total: registrations.length,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load registrations.");
  }
}
