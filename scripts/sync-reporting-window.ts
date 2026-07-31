/**
 * Ensure July 2026 (and optional month) reporting period rows use IST 1st–10th bounds.
 *
 *   npx tsx scripts/sync-reporting-window.ts
 *   npx tsx scripts/sync-reporting-window.ts 7 2026
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ensureReportingPeriod, getActiveReportPeriod } from "../src/lib/reporting-window";
import { formatIstDateTime } from "../src/lib/timezone";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const argMonth = process.argv[2] ? parseInt(process.argv[2], 10) : null;
    const argYear = process.argv[3] ? parseInt(process.argv[3], 10) : null;
    const active = getActiveReportPeriod();
    const targets = [
      { month: 7, year: 2026 }, // tomorrow's Aug window reports July
      { month: active.month, year: active.year },
    ];
    if (argMonth && argYear) {
      targets.push({ month: argMonth, year: argYear });
    }

    const seen = new Set<string>();
    for (const t of targets) {
      const key = `${t.month}-${t.year}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const period = await ensureReportingPeriod(t.month, t.year);
      console.log(
        `OK  ${t.month}/${t.year}: ${formatIstDateTime(period.opensAt)} IST → ${formatIstDateTime(period.closesAt)} IST (active=${period.isActive})`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
