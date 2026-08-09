/**
 * Reset July 2026 monthly reports so the official Aug 1–10 window starts clean.
 * Deletes ADMIN + EVENTS MonthlyReport rows for month=7 / year=2026.
 *
 *   npx tsx scripts/reset-july-2026-reports.ts
 *   npx tsx scripts/reset-july-2026-reports.ts --dry-run
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

const MONTH = 7;
const YEAR = 2026;
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.monthlyReport.findMany({
      where: { month: MONTH, year: YEAR },
      select: {
        id: true,
        type: true,
        status: true,
        clubId: true,
        club: { select: { name: true } },
        submittedAt: true,
      },
      orderBy: [{ type: "asc" }, { status: "asc" }],
    });

    const submitted = existing.filter((r) => r.status === "SUBMITTED");
    console.log(
      `Found ${existing.length} July ${YEAR} monthly reports (${submitted.length} SUBMITTED).`
    );
    for (const r of submitted) {
      console.log(
        `  ${r.type.padEnd(6)} ${r.club?.name ?? r.clubId ?? "?"}  submittedAt=${r.submittedAt?.toISOString() ?? "—"}`
      );
    }

    if (dryRun) {
      console.log("\nDry run — no changes made.");
      return;
    }

    if (existing.length === 0) {
      console.log("Nothing to reset.");
      return;
    }

    const result = await prisma.monthlyReport.deleteMany({
      where: { month: MONTH, year: YEAR },
    });

    console.log(
      `\nDeleted ${result.count} July ${YEAR} report(s). All clubs will show NOT SUBMITTED / Incomplete.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
