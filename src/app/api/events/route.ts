import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageEvents, isClubUser } from "@/lib/roles";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import { buildEventWhere, serializeEvent } from "@/lib/event";
import { createEventSchema, eventQuerySchema } from "@/lib/validators/event";
import { logActivity } from "@/lib/activity";
import { deriveEventStatus } from "@/lib/event-display";
import { validationError, handleRouteError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

const eventInclude = {
  club: { select: { id: true, name: true } },
  _count: { select: { registrations: true } },
};

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = eventQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { search, type, status, clubId, districtOnly, month, year, page, limit } = parsed.data;
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    const now = new Date();
    const scopeMonth = month ?? now.getMonth() + 1;
    const scopeYear = year ?? now.getFullYear();
    const baseWhere = buildEventWhere({
      search,
      type,
      status,
      clubId,
      districtOnly,
      month: scopeMonth,
      year: scopeYear,
    });

    const where =
      isClubUser(session!.user.role) && session!.user.clubId
        ? {
            AND: [
              baseWhere,
              { OR: [{ clubId: null }, { clubId: session!.user.clubId }] },
            ],
          }
        : baseWhere;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "asc" },
        include: eventInclude,
      }),
      prisma.event.count({ where }),
    ]);
    return NextResponse.json(
      buildPaginatedResult(events.map(serializeEvent), total, page, limit)
    );
  } catch (err) {
    return handleRouteError(err, "Failed to fetch events.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!canManageEvents(role) && !isClubUser(role)) {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    const resolvedClubId =
      isClubUser(role) && session!.user.clubId
        ? session!.user.clubId
        : d.clubId;
    const startDate = new Date(d.startDate);
    const endDate = d.endDate ? new Date(d.endDate) : undefined;
    const status =
      d.status === "CANCELLED"
        ? "CANCELLED"
        : deriveEventStatus({
            status: d.status,
            startDate,
            endDate: endDate ?? null,
          });

    const event = await prisma.event.create({
      data: {
        title: d.title,
        description: d.description,
        startDate,
        endDate,
        location: d.location,
        hostedBy: d.hostedBy,
        collaborations: d.collaborations,
        type: d.type,
        attendees: d.attendees ?? 0,
        status,
        clubId: resolvedClubId,
        maxAttendees: d.maxAttendees,
        registrationOpensAt: d.registrationOpensAt
          ? new Date(d.registrationOpensAt)
          : undefined,
        registrationClosesAt: d.registrationClosesAt
          ? new Date(d.registrationClosesAt)
          : undefined,
        onSiteRegistration: d.onSiteRegistration ?? false,
        serviceHours: d.serviceHours ?? 0,
        budget: d.budget,
      },
      include: { ...eventInclude, gallery: true },
    });

    await logActivity({
      type: "EVENT_CREATED",
      title: `Event "${event.title}" created`,
      clubId: event.clubId ?? undefined,
      userId: session!.user.id,
    });

    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json(serializeEvent(event), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create event.");
  }
}
