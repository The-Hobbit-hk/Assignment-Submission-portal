/**
 * Upsert club portal login accounts (linked to official district clubs).
 *
 *   npm run db:ensure-club-logins
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CLUB_PORTAL_LOGINS } from "../src/lib/club-logins-data";
import { ensureClubPortalLogins } from "../src/lib/club-login-seed";

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
  const results = await ensureClubPortalLogins(prisma);

  for (const result of results) {
    if (result.status === "ok") {
      console.log(`OK  ${result.email} → ${result.clubName} (${result.role})`);
    } else {
      console.warn(`SKIP ${result.email}: ${result.reason}`);
    }
  }

  console.log(`\nDefault password: ${CLUB_PORTAL_LOGINS[0]?.password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
