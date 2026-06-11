/**
 * Sync official District 3131 clubs and remove legacy/demo clubs.
 *
 *   npm run db:import-clubs
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { syncDistrictClubs } from "../src/lib/sync-district-clubs";

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
  const result = await syncDistrictClubs(prisma);
  console.log(
    `District clubs sync complete: ${result.total} official (${result.created} created, ${result.updated} updated, ${result.removed} removed).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
