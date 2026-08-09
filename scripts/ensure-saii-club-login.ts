/**
 * One-off: ensure club + portal login for Symbiosis Artificial Intelligence Institute.
 *   npx tsx scripts/ensure-saii-club-login.ts
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { clubLoginSlug, CLUB_LOGIN_DOMAIN } from "../src/lib/club-logins-data";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";

config({ path: ".env.local" });
config();

const CLUB_NAME = "Rotaract Club of Symbiosis Artificial Intelligence Institute";
/** Provisional local charter id until official RI id is known. */
const CHARTER = "3131-SAII-01";
const ZONE = "Zone 2";
const CITY = "Pune";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: "Artificial Intelligence", mode: "insensitive" } },
          { name: { contains: "Symbiosis Artificial", mode: "insensitive" } },
          { charterNumber: CHARTER },
        ],
      },
      select: {
        id: true,
        name: true,
        charterNumber: true,
        zone: true,
        status: true,
        clubLogins: {
          where: { role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] } },
          select: { email: true, role: true, name: true, mustChangePassword: true },
        },
      },
    });

    console.log("Existing matches:", JSON.stringify(existing, null, 2));

    let club =
      existing.find((c) => c.charterNumber === CHARTER) ??
      existing.find((c) =>
        c.name.toLowerCase().includes("artificial intelligence")
      ) ??
      null;

    if (!club) {
      club = await prisma.club.create({
        data: {
          name: CLUB_NAME,
          charterNumber: CHARTER,
          zone: ZONE,
          city: CITY,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          charterNumber: true,
          zone: true,
          status: true,
          clubLogins: {
            where: { role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] } },
            select: { email: true, role: true, name: true, mustChangePassword: true },
          },
        },
      });
      console.log(`Created club: ${club.name} (${club.charterNumber})`);
    } else if (club.name !== CLUB_NAME) {
      club = await prisma.club.update({
        where: { id: club.id },
        data: { name: CLUB_NAME, zone: club.zone ?? ZONE, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          charterNumber: true,
          zone: true,
          status: true,
          clubLogins: {
            where: { role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] } },
            select: { email: true, role: true, name: true, mustChangePassword: true },
          },
        },
      });
      console.log(`Updated club name → ${club.name}`);
    }

    const slug = clubLoginSlug(CLUB_NAME);
    const email = `${slug}@${CLUB_LOGIN_DOMAIN}`.toLowerCase();
    const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);

    const existingLogin = club.clubLogins[0];
    if (existingLogin) {
      console.log("\n—— Credentials (already existed) ——");
      console.log(`Club:     ${club.name}`);
      console.log(`Email:    ${existingLogin.email}`);
      console.log(`Password: ${COUNCIL_PASSWORD} (shared initial; reset on first login if flagged)`);
      console.log(`Role:     ${existingLogin.role}`);
      return;
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name: `${CLUB_NAME} — Club Login`,
        email,
        password: passwordHash,
        role: "CLUB_PRESIDENT",
        clubId: club.id,
        mustChangePassword: true,
      },
      update: {
        name: `${CLUB_NAME} — Club Login`,
        role: "CLUB_PRESIDENT",
        clubId: club.id,
        password: passwordHash,
        mustChangePassword: true,
      },
    });

    console.log("\n—— Credentials (CREATED) ——");
    console.log(`Club:     ${club.name}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${COUNCIL_PASSWORD}`);
    console.log(`Note:     Must change password on first login.`);
    console.log(`Portal:   Club Portal → https://rotaractdistrict3131.org (or your deploy URL)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
