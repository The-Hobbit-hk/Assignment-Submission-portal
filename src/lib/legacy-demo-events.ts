import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { OFFICIAL_CLUB_CHARTER_IDS, OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";

/** Titles from early demo seeds — not part of the official district calendar. */
export const LEGACY_DEMO_EVENT_TITLE_FRAGMENTS = [
  "Mumbai Central",
  "Pune IT",
  "Thane East",
  "Nashik Hills",
  "District PDI Summit",
  "Blood Donation Drive",
  "Career Fair 2026",
  "Beach Cleanup",
  "Leadership Workshop",
  "Club Social Night",
] as const;

export function legacyDemoEventTitleFilter(): Prisma.EventWhereInput {
  return {
    NOT: {
      OR: LEGACY_DEMO_EVENT_TITLE_FRAGMENTS.map((fragment) => ({
        title: { contains: fragment, mode: "insensitive" as const },
      })),
    },
  };
}

/** Events shown on the public calendar and events pages. */
export function publicCalendarEventWhere(yearStart: Date): Prisma.EventWhereInput {
  return {
    type: { in: ["DISTRICT", "INSTALLATION"] },
    startDate: { gte: yearStart },
    status: { not: "CANCELLED" },
    ...legacyDemoEventTitleFilter(),
    OR: [
      { type: "DISTRICT" },
      {
        type: "INSTALLATION",
        club: OFFICIAL_DISTRICT_CLUB_FILTER,
      },
    ],
  };
}

export function publicDistrictEventWhere(): Prisma.EventWhereInput {
  return {
    type: "DISTRICT",
    status: { in: ["UPCOMING", "ONGOING"] },
    ...legacyDemoEventTitleFilter(),
  };
}

export async function purgeLegacyDemoEvents(prisma: PrismaClient) {
  const byTitle = await prisma.event.deleteMany({
    where: {
      OR: LEGACY_DEMO_EVENT_TITLE_FRAGMENTS.map((fragment) => ({
        title: { contains: fragment, mode: "insensitive" as const },
      })),
    },
  });

  const orphanedInstallations = await prisma.event.deleteMany({
    where: {
      type: "INSTALLATION",
      clubId: null,
    },
  });

  const nonOfficialInstallations = await prisma.event.deleteMany({
    where: {
      type: "INSTALLATION",
      club: {
        charterNumber: { notIn: OFFICIAL_CLUB_CHARTER_IDS },
      },
    },
  });

  return {
    deletedByTitle: byTitle.count,
    deletedOrphanedInstallations: orphanedInstallations.count,
    deletedNonOfficialInstallations: nonOfficialInstallations.count,
  };
}
