/**
 * Production reset: remove demo/test transactional data and zero out every score.
 *
 * KEEPS configuration & roster: users, clubs, members, official events,
 * bluebook tasks/cycles, citation definitions.
 *
 * CLEARS test data: legacy demo events, all bluebook/citation submissions and
 * assignments, monthly reports, event registrations, activity log, the council
 * score cache, and any reporting periods (the "test" reporting window).
 *
 * RESETS: every member's points to 0.
 *
 *   npm run db:reset-production
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { purgeLegacyDemoEvents } from "../src/lib/legacy-demo-events";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL (or DIRECT_URL) in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("Starting production reset…\n");

  const demo = await purgeLegacyDemoEvents(prisma);
  console.log("Legacy demo events removed:", demo);

  const activities = await prisma.activity.deleteMany({});
  console.log(`Activity log entries removed: ${activities.count}`);

  const registrations = await prisma.eventRegistration.deleteMany({});
  console.log(`Event registrations removed: ${registrations.count}`);

  const submissions = await prisma.bluebookSubmission.deleteMany({});
  console.log(`Club bluebook submissions removed: ${submissions.count}`);

  const councilReports = await prisma.councilBluebookReport.deleteMany({});
  console.log(`Council bluebook reports removed: ${councilReports.count}`);

  const councilAssignments = await prisma.councilBluebookAssignment.deleteMany({});
  console.log(`Council bluebook assignments removed: ${councilAssignments.count}`);

  const citations = await prisma.citationAssignment.deleteMany({});
  console.log(`Citation assignments removed: ${citations.count}`);

  const reports = await prisma.monthlyReport.deleteMany({});
  console.log(`Monthly reports removed: ${reports.count}`);

  const scores = await prisma.councilScore.deleteMany({});
  console.log(`Council score cache cleared: ${scores.count}`);

  const periods = await prisma.reportingPeriod.deleteMany({});
  console.log(`Reporting periods (test windows) removed: ${periods.count}`);

  const memberPoints = await prisma.member.updateMany({ data: { points: 0 } });
  console.log(`Member points reset to 0: ${memberPoints.count}`);

  console.log("\nProduction reset complete. All scores are now 0.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
