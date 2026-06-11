import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

config({ path: ".env.local" });
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const count = await prisma.user.count();
  console.log("OK — users:", count);
} catch (e) {
  console.error("FAIL:", e.message);
} finally {
  await prisma.$disconnect();
}
