/**
 * Remove the broad public SELECT/INSERT policies on storage.objects for the
 * `uploads` bucket.
 *
 *   npx tsx scripts/fix-storage-policy.ts
 *
 * The bucket is public, so files are served via public object URLs that do NOT
 * consult RLS. The "Public read uploads" SELECT policy only let anon clients
 * LIST every file in the bucket (Supabase advisor: "Public Bucket Allows
 * Listing"). Uploads use the service_role key, which bypasses RLS, so no policy
 * is needed. Dropping these does not affect the app.
 */
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });
config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DIRECT_URL (or DATABASE_URL) in .env.local.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const before = await client.query<{ policyname: string }>(
    `select policyname from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
      order by policyname`
  );
  console.log(
    "Policies on storage.objects before:",
    before.rows.map((r) => r.policyname).join(", ") || "(none)"
  );

  await client.query(`drop policy if exists "Public read uploads" on storage.objects`);
  await client.query(
    `drop policy if exists "Authenticated upload uploads" on storage.objects`
  );

  const after = await client.query<{ policyname: string }>(
    `select policyname from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
      order by policyname`
  );
  console.log(
    "Policies on storage.objects after: ",
    after.rows.map((r) => r.policyname).join(", ") || "(none)"
  );

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
