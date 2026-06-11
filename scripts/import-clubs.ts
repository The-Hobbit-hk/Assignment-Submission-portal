/**
 * Upsert all District 3131 clubs without wiping members, events, or users.
 *
 *   npm run db:import-clubs
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DISTRICT_CLUBS,
  clubDescription,
  parseCharterDate,
} from "../src/lib/district-clubs-data";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  let created = 0;
  let updated = 0;

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

  console.log(`District clubs import complete: ${DISTRICT_CLUBS.length} total (${created} created, ${updated} updated).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
