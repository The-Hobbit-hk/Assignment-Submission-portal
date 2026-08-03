import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEventRecord } from "@/lib/club-access";
import { serializeRegistration } from "@/lib/event";
import { handleRouteError, apiError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, clubId: true },
    });
    if (!event) return notFound("Event not found.");
    if (
      !canManageEventRecord(
        { role: session!.user.role as UserRole, clubId: session!.user.clubId },
        event.clubId
      )
    ) {
      return forbidden();
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return NextResponse.json(registrations.map(serializeRegistration));
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return notFound("Event not found.");
    if (
      !canManageEventRecord(
        { role: session!.user.role as UserRole, clubId: session!.user.clubId },
        event.clubId
      )
    ) {
      return forbidden();
    }

    const { memberId } = await request.json();
    if (!memberId) {
      return apiError("memberId required.", 400);
    }

    if (event.maxAttendees) {
      const count = await prisma.eventRegistration.count({ where: { eventId: id } });
      if (count >= event.maxAttendees) {
        return apiError("Event is full.", 409);
      }
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventId: id, memberId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.event.update({
      where: { id },
      data: { attendees: { increment: 1 } },
    });

    return NextResponse.json(serializeRegistration(registration), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Registration failed.");
  }
}
