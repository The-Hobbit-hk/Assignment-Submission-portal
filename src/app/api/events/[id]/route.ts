import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEvents, isClubUser } from "@/lib/roles";
import { canAccessClubRecord, canManageEventRecord } from "@/lib/club-access";
import { serializeEvent } from "@/lib/event";
import { updateEventSchema } from "@/lib/validators/event";
import { validationError, handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: { select: { id: true, name: true } },
        gallery: { orderBy: { sortOrder: "asc" } },
        registrations: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) return notFound("Not found.");

    // Attendee PII (emails) is only for district event managers or the
    // host club — everyone else gets the event without the registration list.
    const role = session!.user.role as UserRole;
    const canSeeAttendees =
      canManageEvents(role) ||
      (event.clubId
        ? canAccessClubRecord({ role, clubId: session!.user.clubId }, event.clubId)
        : false);

    const serialized = serializeEvent(event);
    return NextResponse.json({
      ...serialized,
      registrations: canSeeAttendees
        ? event.registrations.map((r) => ({
            id: r.id,
            status: r.status,
            registeredAt: r.registeredAt.toISOString(),
            member: r.member,
          }))
        : [],
    });
  } catch (err) {
    return handleRouteError(err, "Failed to fetch event.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;
  const sessionUser = { role, clubId: session!.user.clubId };

  try {
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { id: true, clubId: true },
    });
    if (!existing) return notFound("Not found.");
    if (!canManageEventRecord(sessionUser, existing.clubId)) {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    // Club users may only keep events on their own club (no reassignment / district takeover).
    const nextClubId = isClubUser(role)
      ? session!.user.clubId ?? existing.clubId
      : d.clubId;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...d,
        clubId: nextClubId,
        startDate: d.startDate ? new Date(d.startDate) : undefined,
        endDate: d.endDate ? new Date(d.endDate) : undefined,
        registrationOpensAt:
          d.registrationOpensAt === undefined
            ? undefined
            : d.registrationOpensAt
              ? new Date(d.registrationOpensAt)
              : null,
        registrationClosesAt:
          d.registrationClosesAt === undefined
            ? undefined
            : d.registrationClosesAt
              ? new Date(d.registrationClosesAt)
              : null,
        // Explicit null clears the capacity; omit when undefined
        maxAttendees: d.maxAttendees === undefined ? undefined : d.maxAttendees,
      },
      include: {
        club: { select: { id: true, name: true } },
        gallery: { orderBy: { sortOrder: "asc" } },
        _count: { select: { registrations: true } },
      },
    });
    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json(serializeEvent(event));
  } catch (err) {
    return handleRouteError(err, "Failed to update event.");
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  try {
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { id: true, clubId: true },
    });
    if (!existing) return notFound("Not found.");
    if (!canManageEventRecord({ role, clubId: session!.user.clubId }, existing.clubId)) {
      return forbidden();
    }

    await prisma.event.delete({ where: { id } });

    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json({ message: "Deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete.");
  }
}
