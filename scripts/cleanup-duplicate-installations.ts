/**
 * Cancel superseded Google-synced installation rows (same club title on an
 * older day than the newest active occurrence).
 *
 * Safe without Google ICS: only collapses same-title duplicates in the DB,
 * keeping the latest startDate.
 *
 *   npx tsx scripts/cleanup-duplicate-installations.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calendarEventTitleKey } from "../src/lib/calendar-event-dedup";
import { rotaryYearStart } from "../src/lib/rotary-year";

config({ path: ".env.local" });
config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});

async function main() {
  const installations = await prisma.event.findMany({
    where: {
      type: "INSTALLATION",
      status: { not: "CANCELLED" },
      startDate: { gte: rotaryYearStart() },
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      description: true,
    },
    orderBy: { startDate: "asc" },
  });

  const byTitle = new Map<string, typeof installations>();
  for (const event of installations) {
    const key = calendarEventTitleKey(event.title);
    const list = byTitle.get(key) ?? [];
    list.push(event);
    byTitle.set(key, list);
  }

  const toCancel: string[] = [];
  for (const [titleKey, rows] of byTitle) {
    if (rows.length < 2) continue;
    const sorted = [...rows].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
    const [keep, ...rest] = sorted;
    console.log(
      `Keep ${keep.id} (${keep.startDate.toISOString()}) for ${titleKey}`
    );
    for (const dup of rest) {
      console.log(
        `Cancel ${dup.id} (${dup.startDate.toISOString()}) — superseded`
      );
      toCancel.push(dup.id);
    }
  }

  if (toCancel.length === 0) {
    console.log("No superseded duplicate installations found.");
    return;
  }

  const result = await prisma.event.updateMany({
    where: { id: { in: toCancel } },
    data: { status: "CANCELLED" },
  });
  console.log(`Cancelled ${result.count} superseded installation(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
