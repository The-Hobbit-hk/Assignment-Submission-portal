import type { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { CLUB_PORTAL_LOGINS, type ClubLoginSeed } from "@/lib/club-logins-data";

export async function upsertClubPortalLogin(
  prisma: PrismaClient,
  login: ClubLoginSeed,
  passwordHash: string
) {
  const club = await prisma.club.findUnique({
    where: { charterNumber: login.riClubId },
    select: { id: true, name: true },
  });

  if (!club) {
    return {
      status: "skipped" as const,
      email: login.email,
      reason: `Club not found: ${login.riClubId}`,
    };
  }

  const email = login.email.toLowerCase().trim();
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name: login.name,
      email,
      password: passwordHash,
      role: login.role,
      clubId: club.id,
    },
    update: {
      name: login.name,
      role: login.role,
      clubId: club.id,
    },
  });

  return {
    status: "ok" as const,
    email: user.email,
    clubName: club.name,
    role: user.role,
  };
}

export async function ensureClubPortalLogins(prisma: PrismaClient) {
  const results = [];

  for (const login of CLUB_PORTAL_LOGINS) {
    const passwordHash = await bcrypt.hash(login.password, 12);
    results.push(await upsertClubPortalLogin(prisma, login, passwordHash));
  }

  return results;
}
