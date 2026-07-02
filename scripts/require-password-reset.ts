/**
 * Flag existing seeded club + council accounts so they are forced to reset
 * their password on the next login. Run once after deploying the
 * mustChangePassword feature to accounts that were created before it existed.
 *
 *   npm run db:require-password-reset
 *
 * The technical system admin is intentionally left untouched so you never lock
 * yourself out; pass INCLUDE_ADMIN=true to include it as well.
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type UserRole } from "../src/generated/prisma/client";
import { SEED_ADMIN } from "../prisma/data/seed-constants";

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

const TARGET_ROLES: UserRole[] = [
  "CLUB_PRESIDENT",
  "CLUB_SECRETARY",
  "COUNCIL_MEMBER",
  "DISTRICT_SECRETARY",
  "REPORTING_SECRETARY",
  "DISTRICT_ADMIN",
];

async function main() {
  const includeAdmin = process.env.INCLUDE_ADMIN === "true";

  const result = await prisma.user.updateMany({
    where: {
      role: { in: TARGET_ROLES },
      ...(includeAdmin ? {} : { email: { not: SEED_ADMIN.email } }),
    },
    data: { mustChangePassword: true },
  });

  console.log(
    `Flagged ${result.count} account(s) to reset their password on next login.`
  );
  if (!includeAdmin) {
    console.log(`(System admin ${SEED_ADMIN.email} was skipped.)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
