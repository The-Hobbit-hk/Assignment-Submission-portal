/**
 * Grant Suraj District Admin access (local testing).
 *
 * Run:
 *   npx tsx scripts/grant-suraj-admin.ts
 *
 * Optional env overrides in .env.local:
 *   SURaj_EMAIL (default: rtrsurajsurkutla@gmail.com)
 *   SURaj_ROLE  (default: DISTRICT_ADMIN)
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

const SURaj_EMAIL = (process.env.SURAJ_EMAIL ??
  "rtrsurajsurkutla@gmail.com").toLowerCase().trim();
const SURaj_ROLE = (process.env.SURAJ_ROLE ?? "DISTRICT_ADMIN").trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const user = await prisma.user.findUnique({ where: { email: SURaj_EMAIL } });
  if (!user) {
    throw new Error(`User not found: ${SURaj_EMAIL}`);
  }

  // Update role for dashboard access.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: SURaj_ROLE as any,
      mustChangePassword: false,
    },
  });

  console.log(
    `Updated ${SURaj_EMAIL} → ${SURaj_ROLE} (mustChangePassword=false)`
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});

