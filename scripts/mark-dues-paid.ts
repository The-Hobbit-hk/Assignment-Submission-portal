/**
 * Mark roster members as district-dues paid from DUES_PAID_LISTS.
 *
 *   npm run db:mark-dues-paid
 *   npm run db:mark-dues-paid -- --dry-run
 *   npm run db:mark-dues-paid -- --club="Aundh"
 *   npm run db:mark-dues-paid -- --club="Sinhgad College of Pharmacy"
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

    console.log(
      `\n${clubResolved.name} (${clubResolved.charterNumber ?? "no charter"}) — ${list.members.length} paid names`
    );

    const roster = await prisma.member.findMany({
      where: { clubId: clubResolved.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        riId: true,
        duesPaid: true,
        status: true,
      },
    });

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
      if (member.duesPaid === "yes") {
        already += 1;
        console.log(`  already  ${paidName} → ${member.firstName} ${member.lastName}`);
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
        `  ${dryRun ? "WOULD MARK" : "marked"} ${paidName} → ${member.firstName} ${member.lastName}`
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
