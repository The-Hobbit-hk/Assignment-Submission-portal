import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
    }),
  });
  const emails = ["vageesha1603@gmail.com", "rtr.harshvardhan3131@gmail.com"];
  try {
    for (const email of emails) {
      const u = await prisma.user.findFirst({
        where: { email },
        select: { id: true, name: true },
      });
      if (!u) {
        console.log(email, "not found");
        continue;
      }
      const report = await prisma.councilBluebookReport.findFirst({
        where: { assigneeId: u.id, cycle: { month: 7, year: 2026 } },
        select: { status: true, submittedAt: true },
      });
      const asg = await prisma.councilBluebookAssignment.groupBy({
        by: ["status"],
        where: { assigneeId: u.id, task: { month: 7, year: 2026 } },
        _count: true,
      });
      console.log(u.name, "report=", report, "tasks=", asg);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
