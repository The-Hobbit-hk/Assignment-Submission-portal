/**
 * Ensure Postgres EventType enum includes GBM and BOD_MEET (added in app schema).
 *
 *   npx tsx scripts/ensure-event-type-enum.ts
 */
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

const NEEDED = ["GBM", "BOD_MEET"] as const;

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local");
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();

  try {
    const { rows } = await client.query<{ enumlabel: string }>(
      `SELECT e.enumlabel
       FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid
       WHERE t.typname = 'EventType'
       ORDER BY e.enumsortorder`
    );
    const existing = new Set(rows.map((r) => r.enumlabel));
    console.log("Current EventType values:", [...existing].join(", "));

    for (const value of NEEDED) {
      if (existing.has(value)) {
        console.log(`OK: ${value} already present`);
        continue;
      }
      // IF NOT EXISTS is supported on Postgres 9.1+ for ADD VALUE in PG 9.1+;
      // use DO block for compatibility when value may already exist from a race.
      await client.query(
        `ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS '${value}'`
      );
      console.log(`Added: ${value}`);
    }

    const after = await client.query<{ enumlabel: string }>(
      `SELECT e.enumlabel
       FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid
       WHERE t.typname = 'EventType'
       ORDER BY e.enumsortorder`
    );
    console.log(
      "Updated EventType values:",
      after.rows.map((r) => r.enumlabel).join(", ")
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
