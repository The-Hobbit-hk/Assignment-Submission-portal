/**
 * Upsert user accounts for the full district council roster.
 *
 *   npm run db:ensure-council-users
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";
import { ensureCouncilUserAccounts } from "../src/lib/council-seed";

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
  const result = await ensureCouncilUserAccounts(prisma);
  console.log(`Council user accounts synced: ${result.users} users.`);
  console.log(`Default password for new logins: ${COUNCIL_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
