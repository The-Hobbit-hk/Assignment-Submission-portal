import { unstable_cache } from "next/cache";
import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import {
  publicCalendarEventWhere,
  publicDistrictEventWhere,
} from "@/lib/legacy-demo-events";
import { prisma } from "@/lib/prisma";

const PUBLIC_EVENTS_REVALIDATE = 120;
const PUBLIC_CLUBS_REVALIDATE = 300;

const publicEventSelect = {
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
  bannerUrl: true,
} as const;

function calendarYearStart() {
  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);
  return yearStart;
}

async function fetchPublicCalendarEvents() {
  return prisma.event.findMany({
    where: publicCalendarEventWhere(calendarYearStart()),
    orderBy: { startDate: "asc" },
    select: {
      ...publicEventSelect,
      club: { select: { name: true, zone: true, city: true } },
    },
  });
}

async function fetchPublicDistrictEvents() {
  return prisma.event.findMany({
    where: publicDistrictEventWhere(),
    orderBy: { startDate: "asc" },
    select: publicEventSelect,
  });
}

async function fetchPublicClubsByZone() {
  const [clubs, presidents] = await Promise.all([
    prisma.club.findMany({
      where: {
        ...OFFICIAL_DISTRICT_CLUB_FILTER,
        status: "ACTIVE",
      },
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        city: true,
        zone: true,
        status: true,
        description: true,
        charterNumber: true,
        logo: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.member.findMany({
      where: {
        role: "PRESIDENT",
        status: "ACTIVE",
        club: {
          ...OFFICIAL_DISTRICT_CLUB_FILTER,
          status: "ACTIVE",
        },
      },
      select: {
        clubId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
  ]);

  const presidentByClub = new Map(
    presidents.map((president) => [president.clubId, president])
  );

  const grouped: Record<string, PublicClub[]> = {};

  for (const club of clubs) {
    const zone = club.zone?.trim() || "Unassigned Zone";
    const president = presidentByClub.get(club.id);
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
      logo: club.logo,
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

type CachedDate = Date | string;

function toDate(value: CachedDate | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function hydratePublicEvent<
  T extends {
    startDate: CachedDate;
    endDate?: CachedDate | null;
    registrationOpensAt?: CachedDate | null;
    registrationClosesAt?: CachedDate | null;
  },
>(event: T) {
  return {
    ...event,
    startDate: toDate(event.startDate)!,
    endDate: toDate(event.endDate),
    registrationOpensAt: toDate(event.registrationOpensAt),
    registrationClosesAt: toDate(event.registrationClosesAt),
  };
}

const getCachedPublicCalendarEvents = unstable_cache(
  fetchPublicCalendarEvents,
  ["public-calendar-events"],
  { revalidate: PUBLIC_EVENTS_REVALIDATE, tags: ["public-events"] }
);

const getCachedPublicDistrictEvents = unstable_cache(
  fetchPublicDistrictEvents,
  ["public-district-events"],
  { revalidate: PUBLIC_EVENTS_REVALIDATE, tags: ["public-events"] }
);

const getCachedPublicClubsByZone = unstable_cache(
  fetchPublicClubsByZone,
  ["public-clubs-by-zone"],
  { revalidate: PUBLIC_CLUBS_REVALIDATE, tags: ["public-clubs"] }
);

export async function getPublicCalendarEvents() {
  const events = await getCachedPublicCalendarEvents();
  return events.map(hydratePublicEvent);
}

export async function getPublicDistrictEvents() {
  const events = await getCachedPublicDistrictEvents();
  return events.map(hydratePublicEvent);
}

export async function getPublicClubsByZone() {
  return getCachedPublicClubsByZone();
}

export type PublicClub = {
  id: string;
  name: string;
  city: string | null;
  zone: string | null;
  status: string;
  description: string | null;
  charterNumber: string | null;
  logo: string | null;
  memberCount: number;
  presidentName: string | null;
  presidentEmail: string | null;
};
