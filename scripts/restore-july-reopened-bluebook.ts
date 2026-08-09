/**
 * Restore July council Blue Book reports that were reopened (DRAFT again)
 * so they show as SUBMITTED and are open for evaluation.
 *
 *   npx tsx scripts/restore-july-reopened-bluebook.ts           # dry-run
 *   npx tsx scripts/restore-july-reopened-bluebook.ts --apply
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ensureCouncilScoresSynced } from "../src/lib/council";

config({ path: ".env.local" });
config();

const MONTH = 7;
const YEAR = 2026;
const APPLY = process.argv.includes("--apply");

function proofCount(proofUrls: unknown): number {
  return Array.isArray(proofUrls) ? proofUrls.length : 0;
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const cycle = await prisma.bluebookCycle.findUnique({
      where: { month_year: { month: MONTH, year: YEAR } },
    });
    if (!cycle) {
      console.error(`No Blue Book cycle for ${MONTH}/${YEAR}`);
      process.exit(1);
    }

    const drafts = await prisma.councilBluebookReport.findMany({
      where: { cycleId: cycle.id, status: "DRAFT" },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Reopen clears submittedAt but keeps proofUrls / submissionNotes.
    const reopened = drafts.filter((r) => {
      const proofs = proofCount(r.proofUrls);
      const notes = (r.submissionNotes ?? "").trim().length > 0;
      return proofs > 0 || notes;
    });

    console.log(
      `July ${YEAR} DRAFT reports: ${drafts.length}; likely reopened (proof/notes): ${reopened.length}`
    );
    console.log(APPLY ? "APPLYING restore…" : "DRY RUN (pass --apply to write)");

    for (const report of reopened) {
      const assignments = await prisma.councilBluebookAssignment.findMany({
        where: {
          assigneeId: report.assigneeId,
          task: { month: MONTH, year: YEAR },
        },
        select: { id: true, status: true },
      });
      const draftAssignments = assignments.filter((a) => a.status === "DRAFT");

      console.log(
        `- ${report.assignee.name ?? "Unnamed"} <${report.assignee.email}>` +
          ` proofs=${proofCount(report.proofUrls)}` +
          ` notes=${(report.submissionNotes ?? "").trim() ? "yes" : "no"}` +
          ` draftTasks=${draftAssignments.length}/${assignments.length}`
      );

      if (!APPLY) continue;

      const submittedAt = report.updatedAt ?? new Date();
      await prisma.$transaction([
        prisma.councilBluebookReport.update({
          where: { id: report.id },
          data: {
            status: "SUBMITTED",
            submittedAt,
            reviewedAt: null,
            reviewedById: null,
          },
        }),
        prisma.councilBluebookAssignment.updateMany({
          where: {
            assigneeId: report.assigneeId,
            task: { month: MONTH, year: YEAR },
            status: "DRAFT",
          },
          data: {
            status: "SUBMITTED",
            submittedAt,
          },
        }),
      ]);
    }

    if (APPLY && reopened.length > 0) {
      await ensureCouncilScoresSynced(prisma, MONTH, YEAR, true);
      console.log("Council scores synced for July 2026.");
    }

    console.log(
      APPLY
        ? `Done. Restored ${reopened.length} report(s) to SUBMITTED.`
        : `Would restore ${reopened.length} report(s). Re-run with --apply.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
