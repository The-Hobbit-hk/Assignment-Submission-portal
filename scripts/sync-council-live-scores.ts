/**
 * Re-import council roster + force-refresh live scores for the current month.
 *   npx tsx scripts/sync-council-live-scores.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { importCouncilRoster } from "../src/lib/council-seed";
import { syncCouncilScores } from "../src/lib/council";
import { COUNCIL_USERS } from "../src/lib/council-roster-data";

config({ path: ".env.local" });
config();

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    console.log(`Importing ${COUNCIL_USERS.length} roster entries…`);
    const imported = await importCouncilRoster(prisma);
    console.log(
      `Users: ${imported.users}, members: ${imported.members}, deactivated: ${imported.deactivated}`
    );

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    console.log(`Syncing council live scores for ${month}/${year}…`);
    await syncCouncilScores(prisma, month, year);

    const suraj = await prisma.member.findFirst({
      where: { email: "rtrsurajsurkutla@gmail.com", status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        homeClub: true,
        profession: true,
        user: { select: { role: true } },
      },
    });
    const score = suraj
      ? await prisma.councilScore.findFirst({
          where: { entityType: "MEMBER", memberId: suraj.id, month, year },
          select: { rank: true, score: true },
        })
      : null;
    const total = await prisma.councilScore.count({
      where: { entityType: "MEMBER", month, year },
    });

    console.log(JSON.stringify({ suraj, score, rankedMembers: total }, null, 2));
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
