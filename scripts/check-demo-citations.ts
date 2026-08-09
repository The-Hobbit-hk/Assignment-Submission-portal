/**
 * Read-only: how many RIY 2026-27 citations the demo club has.
 *   npx tsx scripts/check-demo-citations.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_CLUB_LOGIN } from "../src/lib/demo-club";
import { DRR_CITATIONS_RIY_2026_27 } from "../src/lib/drr-citations-riy-2026";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No DB URL");
  const host = new URL(url.replace(/^postgresql:/, "http:")).host;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_CLUB_LOGIN.email.toLowerCase() },
      select: {
        email: true,
        clubId: true,
        club: { select: { name: true, charterNumber: true } },
      },
    });
    const count = user?.clubId
      ? await prisma.citationAssignment.count({
          where: { clubId: user.clubId, rotaryYearLabel: "2026-27" },
        })
      : 0;
    console.log(
      JSON.stringify(
        {
          host,
          email: user?.email ?? null,
          club: user?.club ?? null,
          assigned: count,
          expected: DRR_CITATIONS_RIY_2026_27.length,
          complete: count >= DRR_CITATIONS_RIY_2026_27.length,
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
