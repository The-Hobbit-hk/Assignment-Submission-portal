/**
 * Upsert all RIY 2026-27 DRR citation definitions and assign them to every
 * official district club (with deadlines + points).
 *
 * Approval remains DISTRICT_ADMIN / SUPER_ADMIN only (DRR + admin portal).
 *
 *   npx tsx scripts/ensure-drr-citations-riy-2026.ts
 *   npx tsx scripts/ensure-drr-citations-riy-2026.ts --dry-run
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "../src/lib/district-clubs-data";
import {
  DRR_CITATIONS_RIY_2026_27,
  DRR_CITATIONS_RIY_2026_27_LABEL,
  drrCitationDefinitionTitle,
} from "../src/lib/drr-citations-riy-2026";
import { validatePeriodForCadence } from "../src/lib/citations-shared";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const CADENCE = "YEARLY" as const;
const DRR_CREATOR_EMAIL = "rtr.dr.karishmaawari@gmail.com";
const period = validatePeriodForCadence(CADENCE, {
  rotaryYearLabel: DRR_CITATIONS_RIY_2026_27_LABEL,
});

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const creator = await prisma.user.findUnique({
      where: { email: DRR_CREATOR_EMAIL },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!creator) {
      throw new Error(
        `DRR account not found (${DRR_CREATOR_EMAIL}). Citations must be owned by the DRR.`
      );
    }

    const clubs = await prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const totalPoints = DRR_CITATIONS_RIY_2026_27.reduce((s, c) => s + c.points, 0);
    console.log(`Creator (DRR only): ${creator.name ?? "—"} <${creator.email}> [${creator.role}]`);
    console.log(`Clubs: ${clubs.length}`);
    console.log(
      `Citations: ${DRR_CITATIONS_RIY_2026_27.length} (YEARLY ${DRR_CITATIONS_RIY_2026_27_LABEL}, ${totalPoints} pts)`
    );
    if (dryRun) {
      console.log("Dry run — no changes.");
      return;
    }

    let definitionsUpserted = 0;
    let assignmentsCreated = 0;
    let assignmentsUpdated = 0;

    for (const seed of DRR_CITATIONS_RIY_2026_27) {
      const title = drrCitationDefinitionTitle(seed);
      const existing = await prisma.citationDefinition.findFirst({
        where: { title, cadence: CADENCE },
      });

      const definition = existing
        ? await prisma.citationDefinition.update({
            where: { id: existing.id },
            data: {
              description: seed.description,
              points: seed.points,
              isActive: true,
              createdById: creator.id, // always attribute to DRR
            },
          })
        : await prisma.citationDefinition.create({
            data: {
              title,
              description: seed.description,
              points: seed.points,
              cadence: CADENCE,
              isActive: true,
              createdById: creator.id,
            },
          });
      definitionsUpserted += 1;

      const existingAssignments = await prisma.citationAssignment.findMany({
        where: {
          definitionId: definition.id,
          periodKey: period.periodKey,
          clubId: { in: clubs.map((c) => c.id) },
        },
        select: { clubId: true },
      });
      const existingIds = new Set(existingAssignments.map((a) => a.clubId));
      const newClubIds = clubs.map((c) => c.id).filter((id) => !existingIds.has(id));

      if (newClubIds.length > 0) {
        const created = await prisma.citationAssignment.createMany({
          data: newClubIds.map((clubId) => ({
            definitionId: definition.id,
            clubId,
            cadence: CADENCE,
            periodKey: period.periodKey,
            year: period.year,
            month: period.month,
            quarter: period.quarter,
            rotaryYearLabel: period.rotaryYearLabel,
            dueDate: seed.dueDate,
            status: "ASSIGNED" as const,
          })),
          skipDuplicates: true,
        });
        assignmentsCreated += created.count;
      }

      if (existingIds.size > 0) {
        const updated = await prisma.citationAssignment.updateMany({
          where: {
            definitionId: definition.id,
            periodKey: period.periodKey,
            clubId: { in: [...existingIds] },
            // Don't overwrite clubs already under review / approved.
            status: { in: ["ASSIGNED", "DRAFT"] },
          },
          data: { dueDate: seed.dueDate },
        });
        assignmentsUpdated += updated.count;
      }

      console.log(
        `OK  #${String(seed.srNo).padStart(2, "0")} ${seed.points}pts · due ${seed.dueDate.toISOString().slice(0, 10)} · +${newClubIds.length} clubs`
      );
    }

    console.log(
      `\nDone: ${definitionsUpserted} definitions, ${assignmentsCreated} new assignments, ${assignmentsUpdated} due dates refreshed.`
    );
    console.log("Review/approve: DISTRICT_ADMIN + SUPER_ADMIN only (DRR / admin portal).");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
