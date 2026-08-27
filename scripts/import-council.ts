/**
 * Upsert district council users and member profiles for live scores.
 *
 *   npm run db:import-council
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";
import { importCouncilRoster } from "../src/lib/council-seed";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const result = await importCouncilRoster(prisma);
  console.log(
    `Council roster import complete: ${result.users} users, ${result.members} member profiles` +
      (result.deactivated ? `, ${result.deactivated} stale profile(s) deactivated.` : ".")
  );
  if (result.createdEmails.length) {
    console.log("\nNew council logins (must change password on first login):");
    console.log(`  Password: ${COUNCIL_PASSWORD}`);
    for (const email of result.createdEmails) {
      console.log(`  - ${email}`);
    }
  }
  if (result.removedUsers.length) {
    console.log("\nRemoved / locked council accounts:");
    for (const u of result.removedUsers) {
      console.log(`  - ${u.name ?? "—"} <${u.email}> (was ${u.previousRole})`);
    }
  }
  console.log(`\nDefault password for council logins: ${COUNCIL_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
