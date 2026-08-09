import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const TREK_KEY = "district-trek-2026";

async function main() {
  const trek = await prisma.event.findFirst({
    where: {
      type: "DISTRICT",
      clubId: null,
      OR: [
        { description: { contains: `calendar-key:${TREK_KEY}` } },
        { title: "District Trek" },
      ],
    },
  });

  if (!trek) {
    console.error("District Trek event not found.");
    process.exit(1);
  }

  await prisma.event.update({
    where: { id: trek.id },
    data: {
      onSiteRegistration: false,
      registrationOpensAt: null,
      registrationClosesAt: null,
      registrationUrl: null,
      status: "UPCOMING",
    },
  });

  console.log(`District Trek (${trek.id}) set to Coming Soon.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
