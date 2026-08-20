/**
 * Cancel a club installation on the public calendar by title/club match.
 *
 *   npx tsx scripts/cancel-installation.ts "Kalyani Nagar"
 *   npx tsx scripts/cancel-installation.ts "Kalyani Nagar" --day=2026-08-23
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calendarEventTitleKey } from "../src/lib/calendar-event-dedup";
import { istDateKey } from "../src/lib/timezone";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL (or DIRECT_URL) in .env.local");
  process.exit(1);
}

const query = process.argv[2]?.trim();
const dayArg = process.argv.find((arg) => arg.startsWith("--day="))?.slice(6);

if (!query) {
  console.error('Usage: npx tsx scripts/cancel-installation.ts "Kalyani Nagar" [--day=2026-08-23]');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const needle = calendarEventTitleKey(query);
  const events = await prisma.event.findMany({
    where: {
      type: "INSTALLATION",
      status: { not: "CANCELLED" },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { club: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      status: true,
      club: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const matches = events.filter((event) => {
    const titleHit =
      calendarEventTitleKey(event.title).includes(needle) ||
      calendarEventTitleKey(event.club?.name ?? "").includes(needle);
    if (!titleHit) return false;
    if (!dayArg) return true;
    return istDateKey(event.startDate) === dayArg;
  });

  if (matches.length === 0) {
    console.log("No matching active installations found.");
    return;
  }

  for (const event of matches) {
    console.log(
      `Cancelling ${event.id} | ${istDateKey(event.startDate)} | ${event.title}`
    );
  }

  const result = await prisma.event.updateMany({
    where: { id: { in: matches.map((event) => event.id) } },
    data: { status: "CANCELLED" },
  });

  console.log(`Cancelled ${result.count} installation(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
