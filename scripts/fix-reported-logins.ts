/**
 * One-off ops: fix Roar NIBM sponsoring club + reset specific council logins.
 *
 *   npx tsx scripts/fix-reported-logins.ts
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";
import { clubDescription, DISTRICT_CLUBS } from "../src/lib/district-clubs-data";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

const RESET_EMAILS = [
  "pranavpisal23@gmail.com",
  "shshendkar27@gmail.com",
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const roar = DISTRICT_CLUBS.find((c) => c.riClubId === "8827434");
    if (!roar) throw new Error("Roar NIBM missing from DISTRICT_CLUBS");

    const updatedClub = await prisma.club.update({
      where: { charterNumber: "8827434" },
      data: {
        description: clubDescription(roar) ?? null,
        name: roar.name,
      },
    });
    console.log(
      `Updated ${updatedClub.name}: ${updatedClub.description ?? "(no description)"}`
    );

    const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);

    for (const email of RESET_EMAILS) {
      const normalized = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (!user) {
        console.log(`MISSING user account: ${normalized}`);
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          mustChangePassword: true,
          role: "COUNCIL_MEMBER",
        },
      });
      console.log(`Reset login for ${normalized} (${user.name ?? "no name"})`);
    }

    console.log(`\nShare with them:`);
    console.log(`  Password: ${COUNCIL_PASSWORD}`);
    console.log(`  They will be asked to change it on first login.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
