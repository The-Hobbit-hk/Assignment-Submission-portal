/**
 * Mark roster members as district-dues paid from DUES_PAID_LISTS.
 *
 *   npm run db:mark-dues-paid
 *   npm run db:mark-dues-paid -- --dry-run
 *   npm run db:mark-dues-paid -- --club="Aundh"
 *   npm run db:mark-dues-paid -- --club="Sinhgad College of Pharmacy"
 *
 * Council members belong to the district council club for scoring, with their
 * real club stored in `homeClub`. This script matches both the club roster and
 * council members whose homeClub points at the target club.
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DUES_PAID_LISTS,
  duesPaidEntryName,
  duesPaidEntryRiId,
  namesMatch,
} from "../src/lib/dues-paid-lists";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL (or DIRECT_URL) in .env.local");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const clubFilter = process.argv
  .find((arg) => arg.startsWith("--club="))
  ?.slice("--club=".length)
  ?.trim()
  .toLowerCase();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type RosterMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  riId: string | null;
  duesPaid: string | null;
  status: string;
  homeClub: string | null;
};

function normalizeClubLabel(name: string) {
  return name
    .toLowerCase()
    .replace(/^rotaract\s+club\s+of\s+/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a council member's display-only homeClub is this club. */
function homeClubMatches(homeClub: string | null | undefined, ...clubNames: string[]) {
  if (!homeClub) return false;
  const home = normalizeClubLabel(homeClub);
  if (!home) return false;
  return clubNames.some((name) => {
    const target = normalizeClubLabel(name);
    if (!target) return false;
    return home === target || home.includes(target) || target.includes(home);
  });
}

function clubSearchKeys(...names: string[]) {
  const keys = new Set<string>();
  for (const name of names) {
    const cleaned = name.replace(/^rotaract\s+club\s+of\s+/i, "").trim();
    if (cleaned.length >= 4) keys.add(cleaned);
    const spaced = cleaned.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (spaced.length >= 4) keys.add(spaced);
    for (const token of spaced.split(" ")) {
      if (token.length >= 5) keys.add(token);
    }
  }
  return [...keys];
}

async function loadClubRoster(
  clubId: string,
  clubName: string,
  listClubName: string
): Promise<RosterMember[]> {
  const select = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    riId: true,
    duesPaid: true,
    status: true,
    homeClub: true,
  } as const;

  const direct = await prisma.member.findMany({
    where: { clubId },
    select,
  });

  const keys = clubSearchKeys(clubName, listClubName);
  const councilCandidates =
    keys.length === 0
      ? []
      : await prisma.member.findMany({
          where: {
            homeClub: { not: null },
            OR: keys.map((key) => ({
              homeClub: { contains: key, mode: "insensitive" as const },
            })),
          },
          select,
        });

  const byId = new Map<string, RosterMember>();
  for (const member of direct) byId.set(member.id, member);
  for (const member of councilCandidates) {
    if (homeClubMatches(member.homeClub, clubName, listClubName)) {
      byId.set(member.id, member);
    }
  }
  return [...byId.values()];
}

async function main() {
  const lists = clubFilter
    ? DUES_PAID_LISTS.filter(
        (list) =>
          list.clubName.toLowerCase().includes(clubFilter) ||
          list.clubCharterId === clubFilter
      )
    : DUES_PAID_LISTS;

  if (lists.length === 0) {
    console.error(`No dues lists matched --club=${clubFilter}`);
    process.exit(1);
  }

  let marked = 0;
  let already = 0;
  let missing = 0;
  let ambiguous = 0;

  for (const list of lists) {
    const club = list.clubCharterId
      ? await prisma.club.findFirst({
          where: { charterNumber: list.clubCharterId },
          select: { id: true, name: true, charterNumber: true },
        })
      : null;

    const clubResolved =
      club ??
      (await prisma.club.findFirst({
        where: { name: { equals: list.clubName, mode: "insensitive" } },
        select: { id: true, name: true, charterNumber: true },
      }));

    if (!clubResolved) {
      console.error(`Club not found: ${list.clubName} (${list.clubCharterId ?? "no charter"})`);
      missing += list.members.length;
      continue;
    }

    const roster = await loadClubRoster(
      clubResolved.id,
      clubResolved.name,
      list.clubName
    );
    const councilHits = roster.filter((m) =>
      homeClubMatches(m.homeClub, clubResolved.name, list.clubName)
    ).length;

    console.log(
      `\n${clubResolved.name} (${clubResolved.charterNumber ?? "no charter"}) — ${list.members.length} paid names` +
        ` (roster=${roster.length - councilHits}, council-home=${councilHits})`
    );

    for (const entry of list.members) {
      const paidName = duesPaidEntryName(entry);
      const riId = duesPaidEntryRiId(entry);

      let matches = riId
        ? roster.filter((member) => (member.riId || "").trim() === riId)
        : [];

      if (matches.length === 0) {
        matches = roster.filter((member) =>
          namesMatch(paidName, member.firstName, member.lastName)
        );
      }

      if (matches.length === 0) {
        missing += 1;
        console.log(`  MISSING  ${paidName}${riId ? ` (RI ${riId})` : ""}`);
        continue;
      }

      if (matches.length > 1) {
        ambiguous += 1;
        console.log(
          `  AMBIGUOUS ${paidName} → ${matches
            .map((m) => `${m.firstName} ${m.lastName} <${m.email}>`)
            .join(" | ")}`
        );
        continue;
      }

      const member = matches[0];
      const viaCouncil = homeClubMatches(
        member.homeClub,
        clubResolved.name,
        list.clubName
      )
        ? " [council]"
        : "";

      if (member.duesPaid === "yes") {
        already += 1;
        console.log(
          `  already  ${paidName} → ${member.firstName} ${member.lastName}${viaCouncil}`
        );
        continue;
      }

      if (!dryRun) {
        await prisma.member.update({
          where: { id: member.id },
          data: {
            duesPaid: "yes",
            ...(riId && !member.riId ? { riId } : {}),
          },
        });
      }
      marked += 1;
      console.log(
        `  ${dryRun ? "WOULD MARK" : "marked"} ${paidName} → ${member.firstName} ${member.lastName}${viaCouncil}`
      );
    }
  }

  console.log(
    `\nDone${dryRun ? " (dry-run)" : ""}: marked=${marked}, already=${already}, missing=${missing}, ambiguous=${ambiguous}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
