/**
 * Upsert official district calendar events (RIY 2026-27).
 *
 *   npm run db:ensure-district-calendar
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDefaultEventBannerUrl } from "../src/lib/event-display";
import {
  DISTRICT_CALENDAR_EVENTS,
  LEGACY_DISTRICT_ASSEMBLY_TITLE,
} from "../src/lib/district-calendar-events";

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

async function findExisting(key: string, title: string) {
  const byKey = await prisma.event.findFirst({
    where: {
      type: "DISTRICT",
      clubId: null,
      description: { contains: `calendar-key:${key}` },
    },
  });
  if (byKey) return byKey;

  if (key === "dist-assembly-2026") {
    const legacy = await prisma.event.findFirst({
      where: {
        type: "DISTRICT",
        title: LEGACY_DISTRICT_ASSEMBLY_TITLE,
      },
    });
    if (legacy) return legacy;
  }

  return prisma.event.findFirst({
    where: { type: "DISTRICT", clubId: null, title },
  });
}

async function main() {
  let created = 0;
  let updated = 0;

  const now = new Date();

  for (const event of DISTRICT_CALENDAR_EVENTS) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const effectiveEnd =
      endDate ??
      (() => {
        const dayEnd = new Date(startDate);
        dayEnd.setHours(23, 59, 59, 999);
        return dayEnd;
      })();
    const status = now > effectiveEnd ? ("COMPLETED" as const) : ("UPCOMING" as const);

    const data = {
      title: event.title,
      type: "DISTRICT" as const,
      status,
      clubId: null,
      startDate,
      endDate,
      location: event.location ?? "District 3131",
      registrationUrl: event.registrationUrl ?? null,
      registrationOpensAt: event.registrationOpensAt
        ? new Date(event.registrationOpensAt)
        : null,
      registrationClosesAt: event.registrationClosesAt
        ? new Date(event.registrationClosesAt)
        : null,
      onSiteRegistration: event.onSiteRegistration ?? false,
      maxAttendees: event.maxAttendees ?? null,
      bannerUrl: getDefaultEventBannerUrl(event.key),
      description: `calendar-key:${event.key}`,
      attendees: 0,
      serviceHours: 0,
    };

    const existing = await findExisting(event.key, event.title);

    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`Updated ${event.title} (${existing.id})`);
    } else {
      const row = await prisma.event.create({ data });
      created++;
      console.log(`Created ${event.title} (${row.id})`);
    }
  }

  console.log(`District calendar sync complete: ${created} created, ${updated} updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
