/**
 * Read-only backup inspection and a local destination snapshot.
 * Does not upload files or update database rows.
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { assessSnapshotFiles, interpretSyncLog, type SyncEntry } from "./assess";
import { KNOWN_BUCKETS, NEW_PROJECT_REF, scrubSecrets } from "./plan";

loadEnv({ path: ".env.local" });
loadEnv();

const dbRoot = path.join(process.cwd(), "backups", "db");
const liveRoot = path.join(process.cwd(), "backups", "storage", "live");
const syncLogPath = path.join(process.cwd(), "backups", "storage", "sync-log.jsonl");
const workDir = path.join(process.cwd(), "backups", "migration");

function log(message: string) {
  console.log(scrubSecrets(message));
}

function databaseClient(): pg.Client | null {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) return null;
  const connectionString = raw
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) throw new Error("Unexpected identifier");
  return `"${name}"`;
}

function listSnapshotDirs(): { name: string; files: { name: string; bytes: number }[] }[] {
  if (!existsSync(dbRoot)) return [];
  return readdirSync(dbRoot)
    .filter((name) => statSync(path.join(dbRoot, name)).isDirectory())
    .sort()
    .map((name) => {
      const dir = path.join(dbRoot, name);
      const files = readdirSync(dir)
        .filter((file) => statSync(path.join(dir, file)).isFile())
        .map((file) => ({ name: file, bytes: statSync(path.join(dir, file)).size }));
      return { name, files };
    });
}

function bucketInventory(): { bucket: string; files: number; bytes: number; present: boolean }[] {
  return KNOWN_BUCKETS.map((bucket) => {
    const dir = path.join(liveRoot, bucket);
    if (!existsSync(dir)) return { bucket, files: 0, bytes: 0, present: false };
    let files = 0;
    let bytes = 0;
    const walk = (current: string) => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile()) {
          files += 1;
          bytes += statSync(full).size;
        }
      }
    };
    walk(dir);
    return { bucket, files, bytes, present: true };
  });
}

function readSyncLog(): SyncEntry[] {
  if (!existsSync(syncLogPath)) return [];
  return readFileSync(syncLogPath, "utf8")
    .split(/\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as SyncEntry);
}

export async function runPreflight() {
  const snapshots = listSnapshotDirs().map((snapshot) => ({
    name: snapshot.name,
    ...assessSnapshotFiles(snapshot.files),
    fileCount: snapshot.files.length,
  }));
  const usable = snapshots.filter((snapshot) => snapshot.status === "usable");
  const storage = bucketInventory();
  const sync = interpretSyncLog(readSyncLog());
  const db = databaseClient();
  const destinationCounts: Record<string, number> = {};
  let destinationRows = 0;
  if (db) {
    await db.connect();
    try {
      const tables = await db.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      );
      for (const table of tables.rows) {
        const count = await db.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ${quoteIdent(table.tablename)}`);
        destinationCounts[table.tablename] = count.rows[0]?.n ?? 0;
        destinationRows += destinationCounts[table.tablename];
      }
    } finally {
      await db.end();
    }
  }

  let destinationBuckets: { name: string; public: boolean | null }[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (url.includes(`${NEW_PROJECT_REF}.supabase.co`) && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const listed = await supabase.storage.listBuckets();
    if (!listed.error) {
      destinationBuckets = (listed.data ?? []).map((bucket) => ({ name: bucket.name, public: bucket.public ?? null }));
    }
  }

  const report = {
    inspectedAt: new Date().toISOString(),
    databaseSnapshots: snapshots.map((snapshot) => ({
      name: snapshot.name,
      status: snapshot.status,
      fileCount: snapshot.fileCount,
    })),
    usableDatabaseSnapshots: usable.length,
    storage,
    sync,
    destinationRows,
    destinationCounts,
    destinationBuckets,
    databaseDecision: usable.length === 0 ? "refuse-empty-snapshot" : destinationRows > 0 ? "keep-destination" : "needs-approval",
    storageDecision: "blocked-until-cap-fits",
    writesPerformed: false,
  };
  await mkdir(workDir, { recursive: true });
  await writeFile(path.join(workDir, "preflight-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  log(`Database snapshot folders: ${snapshots.length}. Usable (non-empty SQL or JSON): ${usable.length}.`);
  for (const snapshot of snapshots) log(`  ${snapshot.name}: ${snapshot.status}, files ${snapshot.fileCount}`);
  for (const bucket of storage) {
    log(`Local ${bucket.bucket}: ${bucket.present ? "present" : "absent"}, files ${bucket.files}, bytes ${bucket.bytes}`);
  }
  log(
    `Last storage list that saw remote objects: ${sync.lastVerifiedRemoteAt ?? "none"} (${sync.lastVerifiedRemoteObjects} objects).`
  );
  log(
    `Runs after that list: ${sync.runsAfterLastSuccess}. Zero-remote runs among them: ${sync.zeroRemoteRunsAfter}. Ambiguous: ${sync.ambiguousAfterLastSuccess}.`
  );
  log(`Destination public rows: ${destinationRows}.`);
  for (const bucket of destinationBuckets) log(`Destination bucket ${bucket.name}: public=${String(bucket.public)}`);
  log("No files were uploaded and no database rows were changed.");
  if (usable.length === 0) {
    log("Database restore from backups/db is refused. Every snapshot folder is empty.");
  }
  return report;
}

export async function runDestinationSnapshot() {
  const db = databaseClient();
  if (!db) throw new Error("DATABASE_URL is missing. Destination snapshot was not created.");
  const runId = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const dir = path.join(workDir, "recovery", runId);
  await mkdir(dir, { recursive: true });
  await db.connect();
  const dump: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  try {
    const tables = await db.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    for (const table of tables.rows) {
      const rows = await db.query(`SELECT * FROM ${quoteIdent(table.tablename)}`);
      dump[table.tablename] = rows.rows;
      counts[table.tablename] = rows.rowCount ?? 0;
    }
  } finally {
    await db.end();
  }
  const body = JSON.stringify(dump);
  const sha256 = createHash("sha256").update(body).digest("hex");
  const dataPath = path.join(dir, "data.json");
  await writeFile(dataPath, body);
  const readBack = await readFile(dataPath);
  const verified = createHash("sha256").update(readBack).digest("hex") === sha256;
  if (!verified) throw new Error("Destination snapshot could not be read back. It is not a rollback point.");
  const manifest = {
    runId,
    sha256,
    bytes: readBack.length,
    counts,
    verified,
    source: "destination-database",
  };
  await writeFile(path.join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  log(`Destination snapshot ${runId} verified. Bytes ${readBack.length}. SHA-256 ${sha256}.`);
  for (const [table, count] of Object.entries(counts)) log(`  ${table}: ${count}`);
  return manifest;
}

export async function planDatabaseMigration() {
  const snapshots = listSnapshotDirs();
  const newest = snapshots.at(-1);
  const assessment = assessSnapshotFiles(newest?.files ?? []);
  const db = databaseClient();
  let destinationRows = 0;
  if (db) {
    await db.connect();
    try {
      const tables = await db.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
      );
      for (const table of tables.rows) {
        const count = await db.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ${quoteIdent(table.tablename)}`);
        destinationRows += count.rows[0]?.n ?? 0;
      }
    } finally {
      await db.end();
    }
  }
  const decision =
    assessment.status !== "usable" ? "refuse-empty-snapshot" : destinationRows > 0 ? "keep-destination" : "needs-approval";
  const plan = {
    newestSnapshot: newest?.name ?? null,
    snapshotStatus: assessment.status,
    destinationRows,
    decision,
    applied: false,
  };
  await mkdir(workDir, { recursive: true });
  await writeFile(path.join(workDir, "database-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  log(`Newest snapshot ${plan.newestSnapshot ?? "none"} is ${plan.snapshotStatus}. Destination rows: ${destinationRows}.`);
  log(`Database migration decision: ${decision}. No rows were written.`);
  if (decision !== "needs-approval") {
    throw new Error(
      decision === "refuse-empty-snapshot"
        ? "Refusing database restore. The local snapshot has no SQL or JSON data."
        : "Refusing database restore. The destination already has rows, and the local snapshot is not newer."
    );
  }
}
