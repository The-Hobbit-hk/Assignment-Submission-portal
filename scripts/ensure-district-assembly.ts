/**
 * Set District Assembly to 4 July 2026 with the public Google Form registration link.
 *
 *   npm run db:ensure-district-assembly
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

const DISTRICT_ASSEMBLY = {
  title: "District Assembly",
  type: "DISTRICT" as const,
  startDate: new Date("2026-07-04T10:00:00+05:30"),
  location: "District 3131",
  registrationOpensAt: new Date("2026-06-01T00:00:00+05:30"),
  registrationClosesAt: new Date("2026-07-04T23:59:59+05:30"),
  registrationUrl: "https://forms.gle/bgaP8kYZup8V3VmT9",
  attendees: 200,
  serviceHours: 10,
  maxAttendees: 300,
};

async function main() {
  const existing = await prisma.event.findFirst({
    where: { title: DISTRICT_ASSEMBLY.title, type: "DISTRICT" },
  });

  if (existing) {
    await prisma.event.update({
      where: { id: existing.id },
      data: {
        startDate: DISTRICT_ASSEMBLY.startDate,
        location: DISTRICT_ASSEMBLY.location,
        registrationOpensAt: DISTRICT_ASSEMBLY.registrationOpensAt,
        registrationClosesAt: DISTRICT_ASSEMBLY.registrationClosesAt,
        registrationUrl: DISTRICT_ASSEMBLY.registrationUrl,
        status: "UPCOMING",
      },
    });
    console.log(`Updated District Assembly (${existing.id}) — 4 July 2026, registration form linked.`);
    return;
  }

  const created = await prisma.event.create({
    data: {
      ...DISTRICT_ASSEMBLY,
      status: "UPCOMING",
      budget: 15000,
    },
  });
  console.log(`Created District Assembly (${created.id}) — 4 July 2026, registration form linked.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
