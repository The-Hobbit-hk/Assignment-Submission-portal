/**
 * Promote DRR Karishma to SUPER_ADMIN (full platform admin access).
 *
 *   npx tsx scripts/grant-drr-super-admin.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const EMAIL = "rtr.dr.karishmaawari@gmail.com";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (!user) {
      throw new Error(`User not found: ${EMAIL}`);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "SUPER_ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(
      `Updated ${updated.email} (${updated.name}): ${user.role} → ${updated.role}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
