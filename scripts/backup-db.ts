/**
 * Back up the production Postgres database to local disk.
 *
 * Produces (best available, "both" strategy):
 *   1. A real SQL dump of the `public` schema via pg_dump (preferred) or the
 *      Supabase CLI — best fidelity for a full restore.
 *   2. A Prisma/JSON export of every table — always written as a guaranteed,
 *      dependency-free fallback.
 *
 * Files land under backups/db/<timestamp>/.
 *
 *   npm run backup:db
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const DIRECT_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const POOLED_URL = process.env.DATABASE_URL;

if (!DIRECT_URL) {
  console.error("Set DIRECT_URL (or DATABASE_URL) in .env.local");
  process.exit(1);
}

const ts = process.env.BACKUP_TS ?? timestamp();
const outDir = path.join(process.cwd(), "backups", "db", ts);
mkdirSync(outDir, { recursive: true });

function timestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}`;
}

function commandExists(cmd: string): boolean {
  const res = spawnSync(cmd, ["--version"], { stdio: "ignore", shell: true });
  return res.status === 0;
}

function tryPgDump(): boolean {
  if (!commandExists("pg_dump")) return false;
  const file = path.join(outDir, "public.sql");
  console.log("→ Running pg_dump (public schema)…");
  const res = spawnSync(
    "pg_dump",
    [DIRECT_URL!, "--schema=public", "--no-owner", "--no-privileges", "-f", file],
    { stdio: "inherit", shell: true }
  );
  if (res.status === 0) {
    console.log(`  ✓ SQL dump: ${path.relative(process.cwd(), file)}`);
    return true;
  }
  console.warn("  ! pg_dump failed; will rely on JSON export.");
  return false;
}

function trySupabaseCli(): boolean {
  if (!commandExists("supabase")) return false;
  console.log("→ Running Supabase CLI dump (schema + data)…");
  const schemaFile = path.join(outDir, "schema.sql");
  const dataFile = path.join(outDir, "data.sql");
  const schema = spawnSync(
    "supabase",
    ["db", "dump", "--db-url", DIRECT_URL!, "-f", schemaFile],
    { stdio: "inherit", shell: true }
  );
  const data = spawnSync(
    "supabase",
    ["db", "dump", "--db-url", DIRECT_URL!, "--data-only", "-f", dataFile],
    { stdio: "inherit", shell: true }
  );
  if (schema.status === 0 && data.status === 0) {
    console.log("  ✓ SQL dump: schema.sql + data.sql");
    return true;
  }
  console.warn("  ! Supabase CLI dump failed; will rely on JSON export.");
  return false;
}

async function jsonExport(): Promise<{ tables: number; rows: number }> {
  console.log("→ Running JSON export (all tables via Prisma)…");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: POOLED_URL ?? DIRECT_URL! }),
  });

  const modelNames = Object.values(Prisma.ModelName) as string[];
  const dump: Record<string, unknown[]> = {};
  let totalRows = 0;

  try {
    for (const name of modelNames) {
      const prop = name.charAt(0).toLowerCase() + name.slice(1);
      const delegate = (prisma as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[
        prop
      ];
      if (!delegate?.findMany) continue;
      const rows = await delegate.findMany();
      dump[name] = rows;
      totalRows += rows.length;
      console.log(`  · ${name}: ${rows.length}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  const file = path.join(outDir, "data.json");
  writeFileSync(
    file,
    JSON.stringify(dump, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2)
  );
  console.log(`  ✓ JSON export: ${path.relative(process.cwd(), file)}`);
  return { tables: Object.keys(dump).length, rows: totalRows };
}

async function main() {
  console.log(`\nDatabase backup → ${path.relative(process.cwd(), outDir)}\n`);

  const sqlOk = tryPgDump() || trySupabaseCli();
  if (!sqlOk) {
    console.warn(
      "\n(No pg_dump / Supabase CLI found — install PostgreSQL client tools or the Supabase CLI for a full-fidelity .sql dump. JSON export still captures all data.)\n"
    );
  }

  const { tables, rows } = await jsonExport();

  console.log(
    `\nDone. ${sqlOk ? "SQL + " : ""}JSON backup complete — ${tables} tables, ${rows} rows.\n`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
