/**
 * Upsert club president member profiles (no wipe).
 *
 *   npm run db:import-presidents
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { importClubPresidents } from "../src/lib/club-presidents-seed";

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
  const result = await importClubPresidents(prisma);
  console.log(
    `Club presidents import complete: ${result.imported} imported, ${result.skipped} skipped.`
  );
  if (result.missing.length) {
    console.log("Skipped (club not in DB):", result.missing.join("; "));
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
