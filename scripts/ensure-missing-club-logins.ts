/**
 * Create standard club portal logins (slug@rotaract3131.org) only for clubs
 * that do not already have a CLUB_PRESIDENT / CLUB_SECRETARY user linked.
 *
 * Pass club names or RI IDs as args, or edit TARGET_CLUBS below.
 *
 *   npx tsx scripts/ensure-missing-club-logins.ts
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CLUB_PORTAL_LOGINS, clubLoginSlug } from "../src/lib/club-logins-data";
import { upsertClubPortalLogin } from "../src/lib/club-login-seed";
import { COUNCIL_PASSWORD } from "../src/lib/council-roster-data";
import { DISTRICT_CLUBS } from "../src/lib/district-clubs-data";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

/** Clubs from the new-presidents sheet that need portal logins if missing. */
const TARGET_CLUBS = [
  "Pune City Legends",
  "Bharati Vidyapeeth New Law College Pune",
  "Pune Zenith",
  "Baramati",
  "Christ University Lavasa",
  "Ajeenkya DY Patil Group",
  "Pune Metro",
  "ALUMNI",
  "Pune Kalyani Nagar",
  "Symbiosis Law",
  "Patalganga",
  "Pune Camp Pioneers",
  "Panvel Central",
  "Pune Samrajya",
  "S. B. Patil College of Architecture",
  "Poona South",
  "Pune Pride",
  "Ramkrishna More College",
  "Vishwakarma Institute of Technology",
  "D. Y. Patil International University",
  "AIT",
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/^rotaract\s+club\s+of\s+/i, "")
    .replace(/^rc\s+/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveClub(query: string) {
  const q = normalize(query);
  const exact = DISTRICT_CLUBS.find((c) => normalize(c.name) === q);
  if (exact) return exact;
  const hits = DISTRICT_CLUBS.filter((c) => {
    const n = normalize(c.name);
    return n.includes(q) || q.includes(n);
  });
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) {
    // Prefer shortest name match (more specific)
    hits.sort((a, b) => a.name.length - b.name.length);
    return hits[0];
  }
  return null;
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const loginByRi = new Map(CLUB_PORTAL_LOGINS.map((l) => [l.riClubId, l]));
    const passwordHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);

    const created: { club: string; email: string }[] = [];
    const already: { club: string; email: string }[] = [];
    const unresolved: string[] = [];
    const missingClubRow: string[] = [];

    console.log("Checking club portal logins for listed clubs…\n");

    for (const query of TARGET_CLUBS) {
      const club = resolveClub(query);
      if (!club) {
        unresolved.push(query);
        continue;
      }

      const seed = loginByRi.get(club.riClubId);
      if (!seed) {
        missingClubRow.push(`${club.name} (${club.riClubId})`);
        continue;
      }

      const dbClub = await prisma.club.findUnique({
        where: { charterNumber: club.riClubId },
        select: { id: true, name: true },
      });
      if (!dbClub) {
        missingClubRow.push(`${club.name} — not in DB yet`);
        continue;
      }

      const existing = await prisma.user.findFirst({
        where: {
          clubId: dbClub.id,
          role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] },
        },
        select: { email: true },
      });

      if (existing) {
        already.push({ club: dbClub.name, email: existing.email });
        console.log(`HAVE  ${dbClub.name} → ${existing.email}`);
        continue;
      }

      const result = await upsertClubPortalLogin(prisma, seed, passwordHash);
      if (result.status === "ok") {
        created.push({ club: result.clubName, email: result.email });
        console.log(`NEW   ${result.clubName} → ${result.email}`);
      } else {
        console.warn(`SKIP  ${seed.email}: ${result.reason}`);
      }
    }

    console.log("\n—— Summary ——");
    console.log(`Created: ${created.length}`);
    console.log(`Already had login: ${already.length}`);
    if (unresolved.length) {
      console.log(`Could not match club name: ${unresolved.join("; ")}`);
    }
    if (missingClubRow.length) {
      console.log(`Club missing from seed/DB: ${missingClubRow.join("; ")}`);
    }

    if (created.length) {
      console.log(`\nNew club logins (password: ${COUNCIL_PASSWORD} — reset on first login):`);
      for (const row of created) {
        console.log(`  ${row.club}\t${row.email}`);
      }
    } else {
      console.log("\nNo new club logins needed — all matched clubs already have one.");
    }

    // Helpful: print expected email for every target even if already present
    console.log("\n—— Full sheet for this batch ——");
    console.log("Club\tLogin email\tStatus");
    for (const query of TARGET_CLUBS) {
      const club = resolveClub(query);
      if (!club) {
        console.log(`${query}\t?\tunmatched`);
        continue;
      }
      const seed = loginByRi.get(club.riClubId);
      const status = created.some((c) => c.email === seed?.email)
        ? "CREATED"
        : already.some((a) => a.email === seed?.email || normalize(a.club) === normalize(club.name))
          ? "exists"
          : "—";
      console.log(`${club.name}\t${seed?.email ?? "?"}\t${status}`);
    }

    void clubLoginSlug;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
