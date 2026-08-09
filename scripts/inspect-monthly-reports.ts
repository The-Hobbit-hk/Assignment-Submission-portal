/**
 * Inspect monthly reports for a club / period (prod debug).
 *   npx tsx scripts/inspect-monthly-reports.ts
 *   npx tsx scripts/inspect-monthly-reports.ts 7 2026
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL");
  process.exit(1);
}

const month = parseInt(process.argv[2] ?? "7", 10);
const year = parseInt(process.argv[3] ?? "2026", 10);

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const host = (() => {
      try {
        return new URL(connectionString.replace(/^postgresql:/, "http:")).host;
      } catch {
        return "(unknown)";
      }
    })();
    console.log(`DB host: ${host}`);
    console.log(`Query: month=${month} year=${year}\n`);

    const all = await prisma.monthlyReport.findMany({
      where: { month, year },
      include: { club: { select: { name: true, charterNumber: true } } },
      orderBy: { status: "desc" },
    });

    console.log(`Total reports for ${month}/${year}: ${all.length}`);
    const submitted = all.filter((r) => r.status === "SUBMITTED");
    console.log(`SUBMITTED: ${submitted.length}`);
    for (const r of submitted) {
      console.log(
        `  ${r.type} | ${r.club?.name ?? r.clubId} | ${r.submittedAt?.toISOString() ?? "—"} | id=${r.id}`
      );
    }

    const sym = await prisma.club.findMany({
      where: { name: { contains: "Symbiosis Skills", mode: "insensitive" } },
      select: { id: true, name: true, charterNumber: true },
    });
    console.log(`\nSymbiosis Skills clubs: ${sym.length}`);
    for (const c of sym) {
      const reports = await prisma.monthlyReport.findMany({
        where: { clubId: c.id },
        orderBy: [{ year: "desc" }, { month: "desc" }, { type: "asc" }],
      });
      console.log(`  ${c.name} (${c.charterNumber}) id=${c.id}`);
      for (const r of reports) {
        console.log(
          `    ${r.month}/${r.year} ${r.type} ${r.status} submittedAt=${r.submittedAt?.toISOString() ?? "—"}`
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
