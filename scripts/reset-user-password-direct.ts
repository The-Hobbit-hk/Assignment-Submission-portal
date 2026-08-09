/**
 * Reset Aslam (or any user) password using DIRECT_URL from .env.local.
 *   npx tsx scripts/reset-user-password-direct.ts <email>
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const DEFAULT_PASSWORD = process.env.SEED_COUNCIL_PASSWORD ?? "Rotaract@3131";

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();
  if (!email) {
    console.error("Usage: npx tsx scripts/reset-user-password-direct.ts <email>");
    process.exit(1);
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.error("No user found with email:", email);
      process.exit(1);
    }

    console.log(
      "Found:",
      user.name ?? "Unnamed",
      `<${user.email}>`,
      `[${user.role}]`
    );

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, mustChangePassword: true },
    });

    console.log(`Password reset to ${DEFAULT_PASSWORD}. User must change it on next login.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
