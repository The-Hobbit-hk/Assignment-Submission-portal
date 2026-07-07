import type { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import {
  COUNCIL_PASSWORD,
  COUNCIL_USERS,
  DISTRICT_COUNCIL_CLUB,
  type CouncilUserSeed,
} from "@/lib/council-roster-data";

export async function ensureDistrictCouncilClub(prisma: PrismaClient) {
  return prisma.club.upsert({
    where: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
    create: {
      name: DISTRICT_COUNCIL_CLUB.name,
      charterNumber: DISTRICT_COUNCIL_CLUB.riClubId,
      zone: DISTRICT_COUNCIL_CLUB.zone,
      city: DISTRICT_COUNCIL_CLUB.city,
      status: "ACTIVE",
      description: "District council roster for Rotaract District 3131.",
    },
    update: {
      name: DISTRICT_COUNCIL_CLUB.name,
      zone: DISTRICT_COUNCIL_CLUB.zone,
      city: DISTRICT_COUNCIL_CLUB.city,
    },
  });
}

export async function upsertCouncilUser(
  prisma: PrismaClient,
  councilUser: CouncilUserSeed,
  passwordHash: string
) {
  return prisma.user.upsert({
    where: { email: councilUser.email.toLowerCase().trim() },
    create: {
      name: councilUser.name,
      email: councilUser.email.toLowerCase().trim(),
      password: passwordHash,
      role: councilUser.role,
      // Force a password reset on the very first login for seeded accounts.
      mustChangePassword: true,
    },
    update: {
      name: councilUser.name,
      role: councilUser.role,
    },
  });
}

export async function upsertCouncilMember(
  prisma: PrismaClient,
  councilUser: CouncilUserSeed,
  clubId: string,
  userId: string,
  _index: number
) {
  const email = councilUser.email.toLowerCase().trim();
  const data = {
    firstName: councilUser.name,
    lastName: "",
    email,
    profession: councilUser.title,
    // Home club is display-only; the member stays in the district council club for scoring.
    homeClub: councilUser.club,
    role: "MEMBER" as const,
    status: "ACTIVE" as const,
    points: 0,
  };

  // A user can hold only one member record (userId is unique) and it may currently live
  // under their real club. Move/refresh it into the district council club (used for
  // scoring) while keeping the real club as the display-only home club.
  const existing = await prisma.member.findUnique({ where: { userId } });
  if (existing) {
    return prisma.member.update({
      where: { id: existing.id },
      data: { ...data, clubId },
    });
  }

  // No record tied to this user yet — reuse a stray council-club record if one exists.
  return prisma.member.upsert({
    where: { email_clubId: { email, clubId } },
    create: { ...data, clubId, userId },
    update: { ...data, userId },
  });
}

/** Upsert login accounts for every official council roster entry (for Blue Book assignment, etc.). */
export async function ensureCouncilUserAccounts(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);
  let users = 0;

  for (const councilUser of COUNCIL_USERS) {
    await upsertCouncilUser(prisma, councilUser, passwordHash);
    users++;
  }

  return { users };
}

export async function importCouncilRoster(prisma: PrismaClient) {
  const councilClub = await ensureDistrictCouncilClub(prisma);
  const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);

  let users = 0;
  let members = 0;

  for (let i = 0; i < COUNCIL_USERS.length; i++) {
    const councilUser = COUNCIL_USERS[i];
    const user = await upsertCouncilUser(prisma, councilUser, passwordHash);
    await upsertCouncilMember(prisma, councilUser, councilClub.id, user.id, i);
    users++;
    members++;
  }

  return { users, members, clubId: councilClub.id };
}
