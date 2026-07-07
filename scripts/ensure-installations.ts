/**
 * Upsert official RIY 2026-27 club installations on the public calendar.
 *
 *   npm run db:ensure-installations
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DISTRICT_INSTALLATION_EVENTS } from "../src/lib/district-installation-events";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local (use Supabase pooler URI).");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  let created = 0;
  let updated = 0;

  for (const installation of DISTRICT_INSTALLATION_EVENTS) {
    const club = await prisma.club.findUnique({
      where: { charterNumber: installation.clubCharterId },
      select: { id: true, name: true },
    });

    if (!club) {
      console.warn(
        `Skipped "${installation.title}" — club charter ${installation.clubCharterId} not found.`
      );
      continue;
    }

    const startDate = new Date(installation.startDate);
    const endDate = new Date(installation.endDate);
    const data = {
      title: installation.title,
      type: "INSTALLATION" as const,
      status: "UPCOMING" as const,
      clubId: club.id,
      startDate,
      endDate,
      location: installation.location,
      registrationUrl: installation.meetUrl ?? null,
      description: installation.meetUrl ? `Join online: ${installation.meetUrl}` : null,
      serviceHours: 2,
      attendees: 0,
    };

    const existing = await prisma.event.findFirst({
      where: {
        type: "INSTALLATION",
        clubId: club.id,
        title: installation.title,
      },
    });

    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`Updated ${installation.title} (${existing.id})`);
    } else {
      const row = await prisma.event.create({ data });
      created++;
      console.log(`Created ${installation.title} (${row.id})`);
    }
  }

  console.log(`Installations sync complete: ${created} created, ${updated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
