/**
 * Push Prisma schema to Supabase using the direct connection (port 5432).
 * Pooled DATABASE_URL (6543) cannot run DDL on Supabase.
 */
import { execSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!directUrl) {
  console.error("Set DIRECT_URL (or DATABASE_URL) in .env.local");
  process.exit(1);
}

console.log("Pushing schema via direct database connection…");

execSync("npx prisma db push", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: directUrl },
});
