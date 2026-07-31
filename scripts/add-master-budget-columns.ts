/**
 * Add Club Master Budget columns to MonthlyReport.
 *   npx tsx scripts/add-master-budget-columns.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "MonthlyReport" ADD COLUMN IF NOT EXISTS "masterBudgetPassed" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "MonthlyReport" ADD COLUMN IF NOT EXISTS "masterBudgetFileUrl" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "MonthlyReport" ADD COLUMN IF NOT EXISTS "masterBudgetPassDate" TIMESTAMP(3)'
    );
    console.log("Master budget columns ready on MonthlyReport.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
