import type { PrismaClient } from "@/generated/prisma/client";
import { DISTRICT_COUNCIL_CLUB } from "@/lib/council-roster-data";
import {
  DISTRICT_CLUBS,
  OFFICIAL_CLUB_CHARTER_IDS,
  clubDescription,
  parseCharterDate,
} from "@/lib/district-clubs-data";

const PRESERVED_CHARTER_IDS = new Set([
  ...OFFICIAL_CLUB_CHARTER_IDS,
  DISTRICT_COUNCIL_CLUB.riClubId,
]);

export async function syncDistrictClubs(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;
  let removed = 0;

  for (const club of DISTRICT_CLUBS) {
    const data = {
      name: club.name,
      charterNumber: club.riClubId,
      zone: club.zone,
      city: club.city ?? null,
      status: club.status ?? "ACTIVE",
      foundedAt: parseCharterDate(club.charterDate) ?? null,
      description: clubDescription(club) ?? null,
    };

    const existing = await prisma.club.findUnique({
      where: { charterNumber: club.riClubId },
    });

    if (existing) {
      await prisma.club.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.club.create({ data });
      created++;
    }
  }

  const allClubs = await prisma.club.findMany({
    select: { id: true, charterNumber: true, name: true },
  });

  for (const club of allClubs) {
    if (club.charterNumber && PRESERVED_CHARTER_IDS.has(club.charterNumber)) {
      continue;
    }

    await prisma.user.deleteMany({
      where: {
        clubId: club.id,
        role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] },
      },
    });

    await prisma.user.updateMany({
      where: { clubId: club.id },
      data: { clubId: null },
    });

    await prisma.club.delete({ where: { id: club.id } });
    removed++;
    console.log(`Removed non-official club: ${club.name} (${club.charterNumber ?? "no charter"})`);
  }

  return {
    total: DISTRICT_CLUBS.length,
    created,
    updated,
    removed,
  };
}
