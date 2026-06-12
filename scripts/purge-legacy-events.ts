/**
 * Remove demo/seed calendar events (fake club installations, PDI Summit, etc.).
 *
 *   npm run db:purge-legacy-events
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { purgeLegacyDemoEvents } from "../src/lib/legacy-demo-events";

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
  const result = await purgeLegacyDemoEvents(prisma);
  console.log("Legacy demo events removed:", result);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
