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

  const { rows } = await client.query<{
    relname: string;
    rls: boolean;
    forced: boolean;
  }>(
    `select c.relname, c.relrowsecurity as rls, c.relforcerowsecurity as forced
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by c.relname`
  );

  const off = rows.filter((r) => !r.rls);
  console.log(`Tables: ${rows.length}`);
  console.log(`RLS enabled: ${rows.length - off.length}`);
  if (off.length) {
    console.log("Still disabled:", off.map((r) => r.relname).join(", "));
  }

  const clubs = await client.query<{ n: number }>(
    `select count(*)::int as n from public."Club"`
  );
  console.log(`App DB access OK — Club count: ${clubs.rows[0]?.n}`);

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
