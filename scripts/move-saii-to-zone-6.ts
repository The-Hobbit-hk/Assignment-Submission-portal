/**
 * Move SAII club to Zone 6 in the live DB.
 *   npx tsx scripts/move-saii-to-zone-6.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Set DIRECT_URL or DATABASE_URL");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const updated = await prisma.club.updateMany({
      where: {
        OR: [
          { charterNumber: "3131-SAII-01" },
          { name: { contains: "Symbiosis Artificial Intelligence", mode: "insensitive" } },
        ],
      },
      data: { zone: "Zone 6" },
    });

    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { charterNumber: "3131-SAII-01" },
          { name: { contains: "Symbiosis Artificial Intelligence", mode: "insensitive" } },
        ],
      },
      select: { name: true, charterNumber: true, zone: true },
    });

    console.log(`Updated ${updated.count} row(s).`);
    console.log(club);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
