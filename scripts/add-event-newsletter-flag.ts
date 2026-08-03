/**
 * Add Event.forDistrictNewsletter for club newsletter opt-in.
 *   npx tsx scripts/add-event-newsletter-flag.ts
 */
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No DATABASE_URL / DIRECT_URL");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(`
    ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "forDistrictNewsletter" BOOLEAN NOT NULL DEFAULT false
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "Event_forDistrictNewsletter_idx"
      ON "Event"("forDistrictNewsletter")
  `);
  console.log("OK: Event.forDistrictNewsletter ready");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
