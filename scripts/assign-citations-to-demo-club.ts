/**
 * Assign all RIY 2026-27 DRR citations to the demo club login.
 *   npx tsx scripts/assign-citations-to-demo-club.ts
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_CLUB_LOGIN } from "../src/lib/demo-club";
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
  console.error("Set DIRECT_URL or DATABASE_URL");
  process.exit(1);
}

const CADENCE = "YEARLY" as const;
const period = validatePeriodForCadence(CADENCE, {
  rotaryYearLabel: DRR_CITATIONS_RIY_2026_27_LABEL,
});

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const email = DEMO_CLUB_LOGIN.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, clubId: true, club: { select: { id: true, name: true } } },
    });
    if (!user?.clubId || !user.club) {
      throw new Error(`${email} has no linked club. Run: npm run db:ensure-demo-club`);
    }

    console.log(`Assigning to ${user.club.name} (${user.email})`);

    const titles = DRR_CITATIONS_RIY_2026_27.map(drrCitationDefinitionTitle);
    const definitions = await prisma.citationDefinition.findMany({
      where: { cadence: CADENCE, title: { in: titles } },
      select: { id: true, title: true },
    });
    const defByTitle = new Map(definitions.map((d) => [d.title, d]));

    const existing = await prisma.citationAssignment.findMany({
      where: {
        clubId: user.clubId,
        periodKey: period.periodKey,
        definitionId: { in: definitions.map((d) => d.id) },
      },
      select: { id: true, definitionId: true },
    });
    const existingByDef = new Map(existing.map((a) => [a.definitionId, a.id]));

    let created = 0;
    let refreshed = 0;
    let missingDefs = 0;

    const toCreate: {
      definitionId: string;
      clubId: string;
      cadence: typeof CADENCE;
      periodKey: string;
      year: number;
      month: number | null;
      quarter: number | null;
      rotaryYearLabel: string | null;
      dueDate: Date;
      status: "ASSIGNED";
    }[] = [];

    for (const seed of DRR_CITATIONS_RIY_2026_27) {
      const title = drrCitationDefinitionTitle(seed);
      const definition = defByTitle.get(title);
      if (!definition) {
        console.warn(`SKIP missing definition: ${title}`);
        missingDefs += 1;
        continue;
      }

      const existingId = existingByDef.get(definition.id);
      if (existingId) {
        await prisma.citationAssignment.update({
          where: { id: existingId },
          data: { dueDate: seed.dueDate },
        });
        refreshed += 1;
        continue;
      }

      toCreate.push({
        definitionId: definition.id,
        clubId: user.clubId,
        cadence: CADENCE,
        periodKey: period.periodKey,
        year: period.year,
        month: period.month,
        quarter: period.quarter,
        rotaryYearLabel: period.rotaryYearLabel,
        dueDate: seed.dueDate,
        status: "ASSIGNED",
      });
    }

    if (toCreate.length > 0) {
      const result = await prisma.citationAssignment.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      created = result.count;
    }

    const total = await prisma.citationAssignment.count({
      where: { clubId: user.clubId, rotaryYearLabel: DRR_CITATIONS_RIY_2026_27_LABEL },
    });

    console.log(
      `Done: ${created} created, ${refreshed} refreshed, ${missingDefs} missing defs. Total for club: ${total}/${DRR_CITATIONS_RIY_2026_27.length}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
