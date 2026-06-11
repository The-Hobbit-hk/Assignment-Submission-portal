/**
 * Create or reset the district admin login without wiping other data.
 * Use when production DB exists but seed was never run (or admin password unknown).
 *
 *   npm run db:ensure-admin
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_ADMIN } from "../prisma/data/seed-constants";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local (use Supabase pooler URI).");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const passwordHash = await bcrypt.hash(SEED_ADMIN.password, 12);

  await prisma.user.upsert({
    where: { email: SEED_ADMIN.email },
    create: {
      email: SEED_ADMIN.email,
      name: SEED_ADMIN.name,
      password: passwordHash,
      role: "DISTRICT_ADMIN",
    },
    update: {
      name: SEED_ADMIN.name,
      password: passwordHash,
      role: "DISTRICT_ADMIN",
    },
  });

  console.log(`Admin account ready: ${SEED_ADMIN.email}`);
  console.log(`Password: ${SEED_ADMIN.password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
