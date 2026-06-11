import type { Club, User, Prisma, ClubStatus } from "@/generated/prisma/client";
import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import type {
  ClubAnalytics,
  ClubDetail,
  ClubEventItem,
  ClubListItem,
  ClubPerformance,
} from "@/types/club";

const presidentMemberSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  riId: true,
} as const;

export const clubListInclude = {
  president: { select: { id: true, name: true, email: true } },
  secretary: { select: { id: true, name: true, email: true } },
  members: {
    where: { role: "PRESIDENT", status: "ACTIVE" },
    take: 1,
    select: presidentMemberSelect,
  },
  _count: { select: { members: true, events: true } },
} as const;

type ClubWithRelations = Club & {
  president: Pick<User, "id" | "name" | "email"> | null;
  secretary: Pick<User, "id" | "name" | "email"> | null;
  members?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    riId: string | null;
  }>;
  _count?: { members: number; events: number };
};

function resolveClubPresident(club: ClubWithRelations) {
  if (club.president) {
    return {
      id: club.president.id,
      name: club.president.name,
      email: club.president.email,
    };
  }
  const member = club.members?.[0];
  if (!member) return null;
  const name = `${member.firstName} ${member.lastName}`.trim();
  return {
    id: member.id,
    name: name || null,
    email: member.email,
  };
}

export function serializeClubListItem(club: ClubWithRelations): ClubListItem {
  return {
    id: club.id,
    name: club.name,
    charterNumber: club.charterNumber,
    city: club.city,
    zone: club.zone,
    status: club.status,
    foundedAt: club.foundedAt?.toISOString() ?? null,
    serviceHours: club.serviceHours,
    memberCount: club._count?.members ?? 0,
    eventCount: club._count?.events ?? 0,
    president: resolveClubPresident(club),
    secretary: club.secretary
      ? {
          id: club.secretary.id,
          name: club.secretary.name,
          email: club.secretary.email,
        }
      : null,
  };
}

export function serializeClubDetail(club: ClubWithRelations): ClubDetail {
  const listItem = serializeClubListItem(club);
  return {
    id: listItem.id,
    name: listItem.name,
    charterNumber: listItem.charterNumber,
    city: listItem.city,
    zone: listItem.zone,
    status: listItem.status,
    foundedAt: listItem.foundedAt,
    serviceHours: listItem.serviceHours,
    president: listItem.president,
    secretary: listItem.secretary,
    description: club.description,
    logo: club.logo,
    createdAt: club.createdAt.toISOString(),
    updatedAt: club.updatedAt.toISOString(),
  };
}

export function buildClubWhere(params: {
  search?: string;
  status?: string;
  zone?: string;
}) {
  const where: Prisma.ClubWhereInput = { ...OFFICIAL_DISTRICT_CLUB_FILTER };
  if (params.status) where.status = params.status as ClubStatus;
  if (params.zone) where.zone = params.zone;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { city: { contains: params.search, mode: "insensitive" } },
      { charterNumber: { contains: params.search, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function computeClubAnalytics(
  clubId: string,
  prisma: typeof import("@/lib/prisma").prisma
): Promise<ClubAnalytics> {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalMembers,
    activeMembers,
    totalEvents,
    upcomingEvents,
    completedEvents,
    club,
    events,
    membersByMonth,
  ] = await Promise.all([
    prisma.member.count({ where: { clubId } }),
    prisma.member.count({ where: { clubId, status: "ACTIVE" } }),
    prisma.event.count({ where: { clubId } }),
    prisma.event.count({ where: { clubId, status: "UPCOMING" } }),
    prisma.event.count({ where: { clubId, status: "COMPLETED" } }),
    prisma.club.findUnique({ where: { id: clubId } }),
    prisma.event.findMany({
      where: { clubId, status: "COMPLETED" },
      select: { attendees: true, serviceHours: true },
    }),
    prisma.member.findMany({
      where: { clubId, joinedAt: { gte: sixMonthsAgo } },
      select: { joinedAt: true },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const totalServiceHours =
    (club?.serviceHours ?? 0) +
    events.reduce((sum, e) => sum + e.serviceHours, 0);

  const averageAttendance =
    events.length > 0
      ? Math.round(
          events.reduce((sum, e) => sum + e.attendees, 0) / events.length
        )
      : 0;

  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthMap.set(
      d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      0
    );
  }
  membersByMonth.forEach((m) => {
    const key = m.joinedAt.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
  });

  return {
    totalMembers,
    activeMembers,
    totalEvents,
    upcomingEvents,
    completedEvents,
    totalServiceHours,
    averageAttendance,
    memberGrowth: Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    })),
  };
}

export async function computeClubPerformance(
  clubId: string,
  prisma: typeof import("@/lib/prisma").prisma
): Promise<ClubPerformance> {
  const analytics = await computeClubAnalytics(clubId, prisma);

  const allClubs = await prisma.club.findMany({
    where: { ...OFFICIAL_DISTRICT_CLUB_FILTER, status: "ACTIVE" },
    include: { _count: { select: { members: true, events: true } } },
    orderBy: { serviceHours: "desc" },
  });

  const rank =
    allClubs.findIndex((c) => c.id === clubId) + 1 || allClubs.length;

  const memberScore = Math.min(100, analytics.activeMembers * 2);
  const eventScore = Math.min(100, analytics.completedEvents * 5);
  const serviceScore = Math.min(100, Math.round(analytics.totalServiceHours / 50));
  const attendanceScore = Math.min(100, analytics.averageAttendance * 2);

  const score = Math.round(
    (memberScore + eventScore + serviceScore + attendanceScore) / 4
  );

  return {
    score,
    rank,
    metrics: [
      {
        label: "Active Members",
        value: analytics.activeMembers,
        target: 50,
        unit: "members",
      },
      {
        label: "Completed Events",
        value: analytics.completedEvents,
        target: 20,
        unit: "events",
      },
      {
        label: "Service Hours",
        value: analytics.totalServiceHours,
        target: 500,
        unit: "hours",
      },
      {
        label: "Avg. Attendance",
        value: analytics.averageAttendance,
        target: 40,
        unit: "people",
      },
    ],
  };
}

export function serializeClubEvent(event: {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  type: ClubEventItem["type"];
  status: ClubEventItem["status"];
  attendees: number;
  serviceHours: number;
}): ClubEventItem {
  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    location: event.location,
    type: event.type,
    status: event.status,
    attendees: event.attendees,
    serviceHours: event.serviceHours,
  };
}
