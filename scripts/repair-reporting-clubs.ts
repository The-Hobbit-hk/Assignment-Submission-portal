/**
 * Link orphaned monthly reports to the correct club and report period.
 *
 *   npm run db:repair-reporting-clubs
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  getActiveReportPeriod,
  getSubmissionWindowForReportPeriod,
} from "../src/lib/reporting";

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
  const active = getActiveReportPeriod();
  let repaired = 0;

  const orphans = await prisma.monthlyReport.findMany({
    where: { clubId: null },
    orderBy: { updatedAt: "desc" },
  });

  for (const report of orphans) {
    let clubId = report.submittedById
      ? (
          await prisma.user.findUnique({
            where: { id: report.submittedById },
            select: { clubId: true },
          })
        )?.clubId
      : null;

    if (!clubId) {
      const bavdhanClub = await prisma.club.findUnique({
        where: { charterNumber: "8827103" },
        select: { id: true },
      });
      const bavdhanUser = await prisma.user.findUnique({
        where: { email: "bavdhan@rotaract3131.org" },
        select: { id: true, clubId: true },
      });
      if (bavdhanClub && bavdhanUser?.clubId === bavdhanClub.id) {
        clubId = bavdhanClub.id;
      }
    }

    if (!clubId) {
      console.warn(`SKIP report ${report.id} (${report.type} ${report.month}/${report.year}) — no club match`);
      continue;
    }

    const submissionWindow = getSubmissionWindowForReportPeriod(active.month, active.year);
    const month =
      report.month === submissionWindow.month && report.year === submissionWindow.year
        ? active.month
        : report.month;

    await prisma.monthlyReport.update({
      where: { id: report.id },
      data: {
        clubId,
        month,
        submittedById: report.submittedById ?? undefined,
      },
    });

    repaired++;
    console.log(`OK  ${report.type} ${report.month}/${report.year} → club ${clubId} (month ${month})`);
  }

  console.log(`\nRepaired ${repaired} report(s). Active report period: ${active.month}/${active.year}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
