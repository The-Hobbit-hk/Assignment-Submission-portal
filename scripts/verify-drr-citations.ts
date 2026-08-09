import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No DB URL");
  const host = new URL(url.replace(/^postgresql:/, "http:")).host;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const defs = await prisma.citationDefinition.count({
      where: { title: { startsWith: "01." } },
    });
    const sample = await prisma.citationDefinition.findFirst({
      where: { title: { startsWith: "01." } },
      include: { createdBy: { select: { email: true, name: true } } },
    });
    const assignments = await prisma.citationAssignment.count({
      where: { rotaryYearLabel: "2026-27" },
    });
    const defCount = await prisma.citationDefinition.count({
      where: { title: { startsWith: "0" }, cadence: "YEARLY" },
    });
    console.log(
      JSON.stringify(
        {
          host,
          yearlyDefsApprox: defCount,
          sampleCreator: sample?.createdBy,
          sampleTitle: sample?.title,
          assignments2026_27: assignments,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
