/**
 * Compare official council roster vs DB Member scores roster.
 *   npx tsx scripts/audit-council-roster.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  COUNCIL_MEMBER_FILTER,
  COUNCIL_USERS,
  DISTRICT_COUNCIL_CLUB,
} from "../src/lib/council-roster-data";

config({ path: ".env.local" });
config();

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No DB URL");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const club = await prisma.club.findUnique({
      where: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
      select: { id: true, name: true },
    });

    const members = await prisma.member.findMany({
      where: COUNCIL_MEMBER_FILTER,
      select: {
        id: true,
        email: true,
        firstName: true,
        userId: true,
        avatar: true,
        homeClub: true,
        profession: true,
        user: { select: { email: true, name: true, role: true } },
      },
    });

    const byEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));
    const rosterEmails = new Set(COUNCIL_USERS.map((u) => u.email.toLowerCase()));

    const missing = COUNCIL_USERS.filter((u) => !byEmail.has(u.email.toLowerCase()));
    const extra = members.filter((m) => !rosterEmails.has(m.email.toLowerCase()));
    const unlinked = members.filter((m) => !m.userId);
    const staleName = COUNCIL_USERS.filter((u) => {
      const m = byEmail.get(u.email.toLowerCase());
      return m && m.firstName !== u.name;
    }).map((u) => ({
      email: u.email,
      roster: u.name,
      db: byEmail.get(u.email.toLowerCase())?.firstName,
    }));

    const suraj = byEmail.get("rtrsurajsurkutla@gmail.com");
    const surajUser = await prisma.user.findUnique({
      where: { email: "rtrsurajsurkutla@gmail.com" },
      select: { id: true, name: true, role: true, email: true },
    });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const scores = await prisma.councilScore.count({
      where: { entityType: "MEMBER", month, year },
    });
    const surajScore = suraj
      ? await prisma.councilScore.findFirst({
          where: { entityType: "MEMBER", memberId: suraj.id, month, year },
          select: { rank: true, score: true },
        })
      : null;

    console.log(
      JSON.stringify(
        {
          club,
          rosterCount: COUNCIL_USERS.length,
          memberCount: members.length,
          scoresThisMonth: scores,
          month,
          year,
          missingCount: missing.length,
          missing: missing.map((m) => ({ name: m.name, email: m.email })),
          extraCount: extra.length,
          extra: extra.map((m) => ({ name: m.firstName, email: m.email })),
          unlinkedCount: unlinked.length,
          staleNameCount: staleName.length,
          staleName: staleName.slice(0, 15),
          surajUser,
          surajMember: suraj
            ? {
                id: suraj.id,
                firstName: suraj.firstName,
                userId: suraj.userId,
                homeClub: suraj.homeClub,
                profession: suraj.profession,
                avatar: suraj.avatar,
              }
            : null,
          surajScore,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
