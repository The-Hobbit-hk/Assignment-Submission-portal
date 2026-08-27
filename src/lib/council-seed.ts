import type { PrismaClient, UserRole } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import {
  COUNCIL_PASSWORD,
  COUNCIL_USERS,
  DISTRICT_COUNCIL_CLUB,
  type CouncilUserSeed,
} from "@/lib/council-roster-data";

/** Do not downgrade these when re-importing the roster. */
const PRESERVE_ROLES = new Set<UserRole>(["SUPER_ADMIN", "DISTRICT_ADMIN"]);

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
  const email = councilUser.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        name: councilUser.name,
        email,
        password: passwordHash,
        role: councilUser.role,
        mustChangePassword: true,
      },
    });
  }

  const keepRole = PRESERVE_ROLES.has(existing.role);
  return prisma.user.update({
    where: { id: existing.id },
    data: {
      name: councilUser.name,
      ...(keepRole ? {} : { role: councilUser.role }),
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
  const profile = {
    firstName: councilUser.name,
    lastName: "",
    email,
    profession: councilUser.title,
    // Home club is display-only; the member stays in the district council club for scoring.
    homeClub: councilUser.club,
    role: "MEMBER" as const,
    status: "ACTIVE" as const,
    ...(councilUser.photo ? { avatar: councilUser.photo } : {}),
  };

  // A user can hold only one member record (userId is unique) and it may currently live
  // under their real club. Move/refresh it into the district council club (used for
  // scoring) while keeping the real club as the display-only home club.
  const existing = await prisma.member.findUnique({ where: { userId } });
  if (existing) {
    return prisma.member.update({
      where: { id: existing.id },
      data: { ...profile, clubId },
    });
  }

  // No record tied to this user yet — reuse a stray council-club record if one exists.
  return prisma.member.upsert({
    where: { email_clubId: { email, clubId } },
    create: { ...profile, clubId, userId, points: 0 },
    update: { ...profile, userId },
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
  const createdEmails: string[] = [];

  for (let i = 0; i < COUNCIL_USERS.length; i++) {
    const councilUser = COUNCIL_USERS[i];
    const email = councilUser.email.toLowerCase().trim();
    const existed = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const user = await upsertCouncilUser(prisma, councilUser, passwordHash);
    await upsertCouncilMember(prisma, councilUser, councilClub.id, user.id, i);
    users++;
    members++;
    if (!existed) createdEmails.push(email);
  }

  const rosterEmails = COUNCIL_USERS.map((u) => u.email.toLowerCase().trim());
  const deactivated = await prisma.member.updateMany({
    where: {
      clubId: councilClub.id,
      status: "ACTIVE",
      email: { notIn: rosterEmails },
    },
    data: { status: "INACTIVE" },
  });

  // Demote / lock login for council accounts no longer on the official roster.
  const staleUsers = await prisma.user.findMany({
    where: {
      email: { notIn: rosterEmails },
      role: {
        in: [
          "COUNCIL_MEMBER",
          "DISTRICT_SECRETARY",
          "REPORTING_SECRETARY",
        ],
      },
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const lockedPassword = await bcrypt.hash(
    `revoked-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    12
  );
  for (const stale of staleUsers) {
    await prisma.user.update({
      where: { id: stale.id },
      data: {
        role: "MEMBER",
        password: lockedPassword,
        mustChangePassword: true,
      },
    });
  }

  return {
    users,
    members,
    clubId: councilClub.id,
    deactivated: deactivated.count,
    createdEmails,
    removedUsers: staleUsers.map((u) => ({
      email: u.email,
      name: u.name,
      previousRole: u.role,
    })),
  };
}
