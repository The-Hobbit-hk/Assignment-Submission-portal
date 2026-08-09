/**
 * Apply on-site registration schema when prisma db push hangs on the pooler.
 *
 *   npx tsx scripts/apply-public-registration-schema.ts
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { Client } from "pg";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

async function main() {
  const sqlPath = path.join(
    process.cwd(),
    "prisma/migrations-manual/public-event-registration.sql"
  );
  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(sql);
    console.log("On-site registration schema applied.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already exists")) {
      console.log("Schema already applied (some objects existed).");
    } else {
      // Apply column only if full script failed on duplicate FK
      await client.query(
        `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "onSiteRegistration" BOOLEAN NOT NULL DEFAULT false`
      );
      console.log("Ensured Event.onSiteRegistration column exists.");
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
