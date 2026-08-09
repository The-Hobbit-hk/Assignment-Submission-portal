/**
 * Enable on-site registration for District Trek (RIY 2026-27).
 *
 *   npx tsx scripts/ensure-district-trek-registration.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

const TREK_KEY = "district-trek-2026";

async function main() {
  const trek = await prisma.event.findFirst({
    where: {
      type: "DISTRICT",
      clubId: null,
      OR: [
        { description: { contains: `calendar-key:${TREK_KEY}` } },
        { title: "District Trek" },
      ],
    },
  });

  if (!trek) {
    console.error("District Trek event not found. Run: npm run db:ensure-district-calendar");
    process.exit(1);
  }

  await prisma.event.update({
    where: { id: trek.id },
    data: {
      registrationOpensAt: new Date("2026-07-08T00:00:00+05:30"),
      registrationClosesAt: new Date("2026-08-15T23:59:59+05:30"),
      onSiteRegistration: true,
      registrationUrl: null,
      status: "UPCOMING",
    },
  });

  console.log(`District Trek (${trek.id}) — on-site registration is open until 15 Aug 2026.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
