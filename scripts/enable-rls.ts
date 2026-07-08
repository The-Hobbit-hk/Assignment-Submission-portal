/**
 * Enable Row-Level Security on every table in the public schema.
 *
 *   npx tsx scripts/enable-rls.ts
 *
 * Why: Supabase exposes a REST/GraphQL Data API over the `public` schema that is
 * only gated by RLS + the (public) anon key. With RLS disabled, anyone could read
 * or write every table (including User.password hashes). This app talks to the DB
 * exclusively through Prisma as the `postgres` role, which OWNS the tables and
 * therefore BYPASSES RLS (we ENABLE, never FORCE), so the app is unaffected — but
 * the anon/authenticated roles behind the Data API get denied by default.
 */
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });
config();

// DDL is safest over the direct/session connection (5432), not the txn pooler.
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DIRECT_URL (or DATABASE_URL) in .env.local.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const { rows: tables } = await client.query<{ tablename: string }>(
    `select tablename from pg_tables where schemaname = 'public' order by tablename`
  );

  console.log(`Found ${tables.length} tables in public schema.\n`);

  for (const { tablename } of tables) {
    await client.query(
      `alter table public."${tablename}" enable row level security`
    );
    console.log(`RLS enabled: ${tablename}`);
  }

  // Verify.
  const { rows: status } = await client.query<{
    tablename: string;
    rowsecurity: boolean;
  }>(
    `select c.relname as tablename, c.relrowsecurity as rowsecurity
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by c.relname`
  );

  const stillOff = status.filter((s) => !s.rowsecurity);
  console.log(
    `\nVerification: ${status.length - stillOff.length}/${status.length} tables have RLS enabled.`
  );
  if (stillOff.length) {
    console.log("Still disabled:", stillOff.map((s) => s.tablename).join(", "));
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
