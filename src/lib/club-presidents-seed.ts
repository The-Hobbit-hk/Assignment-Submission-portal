import type { PrismaClient } from "@/generated/prisma/client";
import {
  CLUB_PRESIDENTS,
  presidentBio,
  presidentEmail,
  splitPresidentName,
  type ClubPresidentRecord,
} from "@/lib/club-presidents-data";

export async function upsertClubPresident(
  prisma: PrismaClient,
  record: ClubPresidentRecord
) {
  const club = await prisma.club.findUnique({
    where: { charterNumber: record.clubRiId },
    select: { id: true, name: true },
  });

  if (!club) {
    return { status: "skipped" as const, reason: `Club not found: ${record.clubRiId}` };
  }

  const email = presidentEmail(record);
  const { firstName, lastName } = splitPresidentName(record.fullName);

  await prisma.member.updateMany({
    where: { clubId: club.id, role: "PRESIDENT" },
    data: { role: "MEMBER" },
  });

  await prisma.member.upsert({
    where: {
      email_clubId: { email, clubId: club.id },
    },
    create: {
      clubId: club.id,
      firstName,
      lastName,
      email,
      phone: record.phone ?? null,
      riId: record.riMemberId ?? null,
      role: "PRESIDENT",
      status: "ACTIVE",
      profession: "Club President",
      bio: presidentBio(record),
      points: 100,
    },
    update: {
      firstName,
      lastName,
      phone: record.phone ?? null,
      riId: record.riMemberId ?? null,
      role: "PRESIDENT",
      status: "ACTIVE",
      profession: "Club President",
      bio: presidentBio(record),
    },
  });

  return { status: "ok" as const, clubName: club.name };
}

export async function importClubPresidents(prisma: PrismaClient) {
  let imported = 0;
  let skipped = 0;
  const missing: string[] = [];

  for (const record of CLUB_PRESIDENTS) {
    const result = await upsertClubPresident(prisma, record);
    if (result.status === "ok") {
      imported++;
    } else {
      skipped++;
      missing.push(`${record.fullName} (${record.clubRiId})`);
    }
  }

  return { imported, skipped, missing };
}
