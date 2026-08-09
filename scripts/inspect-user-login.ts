/**
 * Inspect a council user's login state (read-only).
 *   npx tsx scripts/inspect-user-login.ts <email>
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
    console.error("Usage: npx tsx scripts/inspect-user-login.ts <email>");
    process.exit(1);
  }

  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No DB URL");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { name: { contains: email.split("@")[0], mode: "insensitive" } },
          { name: { contains: "aslam", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const report = [];
    for (const u of users) {
      const matchesDefault = u.password
        ? await bcrypt.compare(DEFAULT_PASSWORD, u.password)
        : false;
      report.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        mustChangePassword: u.mustChangePassword,
        hasPassword: Boolean(u.password),
        passwordIsDefault: matchesDefault,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      });
    }

    console.log(JSON.stringify({ searched: email, count: report.length, users: report }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
