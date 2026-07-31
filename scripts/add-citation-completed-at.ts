import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No DATABASE_URL / DIRECT_URL");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(
    `ALTER TABLE "CitationAssignment" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3)`
  );
  console.log("OK: CitationAssignment.completedAt ready");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
