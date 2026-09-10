/**
 * Ensure portal logins for newly added official clubs.
 *   npx tsx scripts/ensure-new-club-logins.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CLUB_PORTAL_LOGINS } from "../src/lib/club-logins-data";
import { upsertClubPortalLogin } from "../src/lib/club-login-seed";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";

const NEW_CHARTERS = ["8828701", "8828681", "8828703", "8827442", "8828101"];

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Set DATABASE_URL / DIRECT_URL");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);
    const rows: { club: string; email: string; charter: string; status: string }[] = [];

    for (const charter of NEW_CHARTERS) {
      const login = CLUB_PORTAL_LOGINS.find((l) => l.riClubId === charter);
      if (!login) {
        rows.push({ club: "?", email: "-", charter, status: "no login seed" });
        continue;
      }

      const club = await prisma.club.findUnique({
        where: { charterNumber: charter },
        select: {
          id: true,
          name: true,
          clubLogins: {
            where: { role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] } },
            select: { email: true },
          },
        },
      });

      if (!club) {
        rows.push({ club: login.name, email: login.email, charter, status: "club missing" });
        continue;
      }

      const hadLogin = club.clubLogins.length > 0;
      const result = await upsertClubPortalLogin(prisma, login, passwordHash);
      rows.push({
        club: club.name,
        email: result.status === "ok" ? result.email : login.email,
        charter,
        status: hadLogin ? "already had login (upserted)" : "created",
      });
    }

    console.log("\nClub portal credentials (new / remapped clubs)\n");
    console.log(`Initial password for all: ${COUNCIL_PASSWORD}`);
    console.log("(must change on first login)\n");
    for (const r of rows) {
      console.log(`${r.status.padEnd(28)} ${r.email}`);
      console.log(`  ${r.club} (${r.charter})\n`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
