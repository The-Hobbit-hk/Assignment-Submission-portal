/**
 * Reset a user's password to the default and set mustChangePassword = true.
 *
 * Usage:
 *   npx tsx scripts/reset-user-password.ts <email>
 *
 * Requires DATABASE_URL (or DIRECT_URL) to be set in environment or .env file.
 * Default password: Rotaract@3131
 */

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = process.env.SEED_COUNCIL_PASSWORD ?? "Rotaract@3131";

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();

  if (!email) {
    console.error("Usage: npx tsx scripts/reset-user-password.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.error("No user found with email:", email);
      process.exit(1);
    }

    console.log("Found user:", user.name ?? "Unnamed", "(" + user.email + ")", "[" + user.role + "]");

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        mustChangePassword: true,
      },
    });

    console.log("Password reset to default. User will be prompted to change on next login.");
  } finally {
    // prisma disconnect is handled by the lib
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
