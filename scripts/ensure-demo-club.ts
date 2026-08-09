/**
 * Create or refresh the sandbox demo club + club-portal login for QA.
 *
 *   npm run db:ensure-demo-club
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_CLUB, DEMO_CLUB_LOGIN } from "../src/lib/demo-club";

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

async function main() {
  const club = await prisma.club.upsert({
    where: { charterNumber: DEMO_CLUB.charterNumber },
    create: {
      name: DEMO_CLUB.name,
      charterNumber: DEMO_CLUB.charterNumber,
      zone: DEMO_CLUB.zone,
      city: DEMO_CLUB.city,
      status: "ACTIVE",
      description: DEMO_CLUB.description,
    },
    update: {
      name: DEMO_CLUB.name,
      zone: DEMO_CLUB.zone,
      city: DEMO_CLUB.city,
      status: "ACTIVE",
      description: DEMO_CLUB.description,
    },
  });

  const passwordHash = await bcrypt.hash(DEMO_CLUB_LOGIN.password, 12);
  const email = DEMO_CLUB_LOGIN.email.toLowerCase().trim();

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name: DEMO_CLUB_LOGIN.name,
      email,
      password: passwordHash,
      role: DEMO_CLUB_LOGIN.role,
      clubId: club.id,
      mustChangePassword: false,
    },
    update: {
      name: DEMO_CLUB_LOGIN.name,
      role: DEMO_CLUB_LOGIN.role,
      clubId: club.id,
      password: passwordHash,
      mustChangePassword: false,
    },
  });

  console.log("Demo club ready:");
  console.log(`  Club:     ${club.name} (${club.charterNumber})`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${DEMO_CLUB_LOGIN.password}`);
  console.log(`  Role:     ${user.role}`);
  console.log(`  Login:    https://rotaractdistrict3131.org/login?portal=club`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
