import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import { prisma } from "@/lib/prisma";

export async function getPublicCalendarEvents() {
  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);

  return prisma.event.findMany({
    where: {
      type: { in: ["DISTRICT", "INSTALLATION"] },
      startDate: { gte: yearStart },
      status: { not: "CANCELLED" },
    },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      location: true,
      type: true,
      status: true,
      registrationOpensAt: true,
      registrationClosesAt: true,
      registrationUrl: true,
      club: { select: { name: true, zone: true, city: true } },
    },
  });
}

export async function getPublicDistrictEvents() {
  return prisma.event.findMany({
    where: {
      type: "DISTRICT",
      status: { in: ["UPCOMING", "ONGOING"] },
    },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      location: true,
      status: true,
      registrationOpensAt: true,
      registrationClosesAt: true,
      registrationUrl: true,
      type: true,
    },
  });
}

export type PublicClub = {
  id: string;
  name: string;
  city: string | null;
  zone: string | null;
  status: string;
  description: string | null;
  charterNumber: string | null;
  memberCount: number;
  presidentName: string | null;
  presidentEmail: string | null;
};

export async function getPublicClubsByZone(): Promise<Record<string, PublicClub[]>> {
  const clubs = await prisma.club.findMany({
    where: {
      ...OFFICIAL_DISTRICT_CLUB_FILTER,
      status: { in: ["ACTIVE", "PROVISIONAL"] },
    },
    orderBy: [{ zone: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { members: true } },
      members: {
        where: { role: "PRESIDENT", status: "ACTIVE" },
        take: 1,
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  const grouped: Record<string, PublicClub[]> = {};

  for (const club of clubs) {
    const zone = club.zone?.trim() || "Unassigned Zone";
    const president = club.members[0];
    const presidentName = president
      ? `${president.firstName} ${president.lastName}`.trim()
      : null;

    const item: PublicClub = {
      id: club.id,
      name: club.name,
      city: club.city,
      zone: club.zone,
      status: club.status,
      description: club.description,
      charterNumber: club.charterNumber,
      memberCount: club._count.members,
      presidentName: presidentName || null,
      presidentEmail: president?.email ?? null,
    };
    if (!grouped[zone]) grouped[zone] = [];
    grouped[zone].push(item);
  }

  return Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  );
}
