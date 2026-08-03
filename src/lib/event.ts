import type { Event, Club, EventGallery, EventRegistration, Member } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { deriveEventStatus } from "@/lib/event-display";

type EventWithRelations = Event & {
  club: Pick<Club, "id" | "name"> | null;
  gallery?: EventGallery[];
  _count?: { registrations: number };
};

export function serializeEvent(e: EventWithRelations) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    location: e.location,
    hostedBy: e.hostedBy,
    collaborations: e.collaborations,
    type: e.type,
    status: deriveEventStatus(e),
    clubId: e.clubId,
    club: e.club,
    attendees: e.attendees,
    maxAttendees: e.maxAttendees,
    registrationOpensAt: e.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: e.registrationClosesAt?.toISOString() ?? null,
    onSiteRegistration: e.onSiteRegistration,
    serviceHours: e.serviceHours,
    budget: e.budget ? Number(e.budget) : null,
    bannerUrl: e.bannerUrl,
    minutesPdfUrl: e.minutesPdfUrl,
    forDistrictNewsletter: e.forDistrictNewsletter,
    registrationCount: e._count?.registrations ?? 0,
    gallery: e.gallery?.map((g) => ({
      id: g.id,
      url: g.url,
      caption: g.caption,
      sortOrder: g.sortOrder,
    })),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export function buildEventWhere(params: {
  search?: string;
  type?: string;
  status?: string;
  clubId?: string;
  districtOnly?: boolean;
  month?: number;
  year?: number;
}): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};
  if (params.type) where.type = params.type as Prisma.EnumEventTypeFilter["equals"];
  if (params.status) where.status = params.status as Prisma.EnumEventStatusFilter["equals"];
  if (params.districtOnly) where.clubId = null;
  else if (params.clubId) where.clubId = params.clubId;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { location: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.month && params.year) {
    const start = new Date(params.year, params.month - 1, 1);
    const end = new Date(params.year, params.month, 0, 23, 59, 59);
    where.startDate = { gte: start, lte: end };
  }
  return where;
}

export function serializeRegistration(
  r: EventRegistration & { member: Pick<Member, "id" | "firstName" | "lastName" | "email"> }
) {
  return {
    id: r.id,
    status: r.status,
    registeredAt: r.registeredAt.toISOString(),
    member: r.member,
  };
}
