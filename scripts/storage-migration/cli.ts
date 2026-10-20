/**
 * Local, resumable storage migration.
 *
 * Reads the new project's database and the local backup mirror.
 * Does not delete source files, destination files, or database rows.
 *
 *   npx tsx scripts/storage-migration/cli.ts dry-run
 *   npx tsx scripts/storage-migration/cli.ts copy --approve
 *   npx tsx scripts/storage-migration/cli.ts copy --approve --within-quota
 *   npx tsx scripts/storage-migration/cli.ts verify
 *   npx tsx scripts/storage-migration/cli.ts verify --download
 *   npx tsx scripts/storage-migration/cli.ts rewrite-references --approve
 *   npx tsx scripts/storage-migration/cli.ts rollback-references --approve
 *   npx tsx scripts/storage-migration/cli.ts pause
 *   npx tsx scripts/storage-migration/cli.ts resume
 *   npx tsx scripts/storage-migration/cli.ts status
 */
import { createHash } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { rollbackGate } from "./assess";
import { planDatabaseMigration, runDestinationSnapshot, runPreflight } from "./preflight-run";
import {
  FREE_STORAGE_LIMIT_BYTES,
  JSON_URL_COLUMNS,
  KNOWN_BUCKETS,
  NEW_PROJECT_REF,
  OLD_PROJECT_REF,
  PRIVATE_PATH_COLUMNS,
  URL_COLUMNS,
  canStart,
  classifyStoredValue,
  contentTypeForPath,
  decideObject,
  isAlreadyExistsError,
  isProjectQuotaError,
  isSafeObjectPath,
  isTransientUploadError,
  quotaDecision,
  referenceRewriteAllowed,
  rewriteJsonSelective,
  rollbackAction,
  scrubSecrets,
  selectWithinQuota,
  type Classified,
  type ObjectDecision,
  type Phase,
} from "./plan";

loadEnv({ path: ".env.local" });
loadEnv();

const workDir = path.join(process.cwd(), "backups", "migration");
const localRoot = path.join(process.cwd(), "backups", "storage", "live");
const statePath = path.join(workDir, "state.json");
const manifestPath = path.join(workDir, "manifest.jsonl");
const referencesPath = path.join(workDir, "references.jsonl");
const snapshotPath = path.join(workDir, "reference-snapshot.jsonl");
const summaryPath = path.join(workDir, "dry-run-summary.json");
const lockPath = path.join(workDir, "lock.json");

type ObjectRow = {
  bucket: string;
  objectPath: string;
  source: "local-backup" | "missing";
  sourceBytes: number | null;
  destBytes: number | null;
  contentType: string;
  decision: ObjectDecision;
  status: "pending" | "copying" | "copied" | "verified" | "skipped" | "failed";
  verification: "none" | "size-match" | "uploaded-sha256" | "checksum-match";
  sha256?: string;
  attempts: number;
  referenced: boolean;
  error?: string;
};

type ReferenceRow = {
  table: string;
  column: string;
  id: string;
  kind: Classified["kind"];
  bucket: string | null;
  objectPath: string | null;
};

type SnapshotRow = {
  table: string;
  column: string;
  id: string;
  format: "text" | "json";
  previous: string;
  next: string;
  applied: boolean;
};

type State = {
  phase: Phase;
  updatedAt: string;
  paused: boolean;
  databaseInspected: boolean;
  sourceApi: "inaccessible" | "reachable" | "not_checked";
  sourceApiStatus: number | null;
  sourceApiDetail: string;
  destinationPublic: Record<string, boolean | null>;
  summary: Record<string, number>;
  lastError?: string;
  checkpoint?: string;
};

const COUNT_TABLES = [
  "User",
  "Club",
  "Member",
  "Event",
  "EventGallery",
  "CitationAssignment",
  "MonthlyReport",
  "CouncilBluebookReport",
  "PublicEventRegistration",
];

function log(message: string) {
  console.log(scrubSecrets(message));
}

function fail(message: string): never {
  console.error(scrubSecrets(message));
  process.exitCode = 1;
  throw new Error(message);
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
    throw new Error("Refusing an unexpected database identifier.");
  }
  return `"${name}"`;
}

function objectKey(bucket: string, objectPath: string): string {
  return `${bucket}/${objectPath}`;
}

function readJsonLines<T>(file: string): T[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split(/\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

function writeJsonLines(file: string, rows: unknown[]) {
  const body = rows.map((row) => JSON.stringify(row)).join("\n");
  writeFileSync(file, rows.length ? `${body}\n` : "");
}

function defaultState(): State {
  return {
    phase: "not_started",
    updatedAt: new Date().toISOString(),
    paused: false,
    databaseInspected: false,
    sourceApi: "not_checked",
    sourceApiStatus: null,
    sourceApiDetail: "",
    destinationPublic: {},
    summary: {},
  };
}

function readState(): State {
  if (!existsSync(statePath)) return defaultState();
  return { ...defaultState(), ...(JSON.parse(readFileSync(statePath, "utf8")) as State) };
}

function writeState(patch: Partial<State>) {
  mkdirSync(workDir, { recursive: true });
  const next = { ...readState(), ...patch, updatedAt: new Date().toISOString() };
  writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireLock() {
  mkdirSync(workDir, { recursive: true });
  if (existsSync(lockPath)) {
    try {
      const lock = JSON.parse(readFileSync(lockPath, "utf8")) as { pid?: number };
      if (lock.pid && lock.pid !== process.pid && pidAlive(lock.pid)) {
        fail(`Another migration command is running (pid ${lock.pid}).`);
      }
    } catch (error) {
      if ((error as Error).message.includes("Another migration command")) throw error;
    }
  }
  writeFileSync(lockPath, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
}

function releaseLock() {
  rmSync(lockPath, { force: true });
}

async function ensureWorkDir() {
  await mkdir(workDir, { recursive: true });
}

function databaseClient(): pg.Client | null {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) return null;
  const connectionString = raw
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
  return new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

function destinationClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) return null;
  if (!url.includes(`${NEW_PROJECT_REF}.supabase.co`)) {
    log("Storage URL is not the new project. Destination inspection was skipped.");
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function probeOldStorage(): Promise<Pick<State, "sourceApi" | "sourceApiStatus" | "sourceApiDetail">> {
  const url = `https://${OLD_PROJECT_REF}.supabase.co/storage/v1/object/public/uploads/`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const detail = scrubSecrets(await response.text()).slice(0, 240);
    const blocked = response.status >= 400 || isProjectQuotaError(detail);
    return {
      sourceApi: blocked ? "inaccessible" : "reachable",
      sourceApiStatus: response.status,
      sourceApiDetail: detail,
    };
  } catch (error) {
    return {
      sourceApi: "inaccessible",
      sourceApiStatus: null,
      sourceApiDetail: scrubSecrets((error as Error).message).slice(0, 240),
    };
  }
}

async function walkLocal(): Promise<Map<string, { bytes: number; fullPath: string }>> {
  const found = new Map<string, { bytes: number; fullPath: string }>();

  async function walk(dir: string, bucket: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, bucket);
        continue;
      }
      if (!entry.isFile()) continue;
      const objectPath = path.relative(path.join(localRoot, bucket), fullPath).split(path.sep).join("/");
      if (!isSafeObjectPath(objectPath)) continue;
      const info = await stat(fullPath);
      found.set(objectKey(bucket, objectPath), { bytes: info.size, fullPath });
    }
  }

  for (const bucket of KNOWN_BUCKETS) {
    const dir = path.join(localRoot, bucket);
    if (!existsSync(dir)) continue;
    await walk(dir, bucket);
  }
  return found;
}

async function listDestination(supabase: SupabaseClient): Promise<{
  objects: Map<string, number>;
  visibility: Record<string, boolean | null>;
}> {
  const objects = new Map<string, number>();
  const visibility: Record<string, boolean | null> = {};
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(scrubSecrets(error.message));
  for (const bucket of buckets ?? []) {
    visibility[bucket.name] = bucket.public ?? null;
  }
  for (const bucket of KNOWN_BUCKETS) {
    if (!(bucket in visibility)) continue;
    await listPrefix(supabase, bucket, "", objects);
  }
  return { objects, visibility };
}

async function listPrefix(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string,
  into: Map<string, number>
) {
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(scrubSecrets(error.message));
    if (!data || data.length === 0) break;
    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        await listPrefix(supabase, bucket, full, into);
      } else if (isSafeObjectPath(full)) {
        const size = (entry.metadata as { size?: number } | null)?.size;
        into.set(objectKey(bucket, full), typeof size === "number" ? size : -1);
      }
    }
    if (data.length < 100) break;
    offset += 100;
  }
}

function classifiedLocation(classified: Classified): { bucket: string | null; objectPath: string | null } {
  if (classified.kind === "old-public" || classified.kind === "already-new" || classified.kind === "signed-or-private") {
    return { bucket: classified.ref.bucket, objectPath: classified.ref.objectPath };
  }
  if (classified.kind === "private-path") {
    return { bucket: classified.bucket, objectPath: classified.objectPath };
  }
  return { bucket: null, objectPath: null };
}

async function scanDatabase(client: pg.Client): Promise<{
  references: ReferenceRow[];
  tableCounts: Record<string, number>;
  missingColumns: string[];
}> {
  const columns = await client.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`
  );
  const have = new Set(columns.rows.map((row) => `${row.table_name}.${row.column_name}`));
  const references: ReferenceRow[] = [];
  const missingColumns: string[] = [];

  async function scanText(table: string, column: string, columnKind: "url" | "private-path") {
    const key = `${table}.${column}`;
    if (!have.has(key)) {
      missingColumns.push(key);
      return;
    }
    const result = await client.query<{ id: string; value: string | null }>(
      `SELECT id, ${quoteIdent(column)} AS value FROM ${quoteIdent(table)} WHERE ${quoteIdent(column)} IS NOT NULL AND ${quoteIdent(column)}::text <> ''`
    );
    for (const row of result.rows) {
      const classified = classifyStoredValue(row.value, columnKind);
      if (classified.kind === "empty") continue;
      const location = classifiedLocation(classified);
      references.push({
        table,
        column,
        id: row.id,
        kind: classified.kind,
        bucket: location.bucket,
        objectPath: location.objectPath,
      });
    }
  }

  for (const [table, column] of URL_COLUMNS) await scanText(table, column, "url");
  for (const [table, column] of PRIVATE_PATH_COLUMNS) await scanText(table, column, "private-path");

  for (const [table, column] of JSON_URL_COLUMNS) {
    const key = `${table}.${column}`;
    if (!have.has(key)) {
      missingColumns.push(key);
      continue;
    }
    const result = await client.query<{ id: string; value: unknown }>(
      `SELECT id, ${quoteIdent(column)} AS value FROM ${quoteIdent(table)} WHERE ${quoteIdent(column)} IS NOT NULL`
    );
    for (const row of result.rows) {
      const strings: string[] = [];
      collectStrings(row.value, strings);
      strings.forEach((value, index) => {
        const classified = classifyStoredValue(value, "url");
        if (classified.kind === "empty" || classified.kind === "external") return;
        const location = classifiedLocation(classified);
        references.push({
          table,
          column: `${column}[${index}]`,
          id: row.id,
          kind: classified.kind,
          bucket: location.bucket,
          objectPath: location.objectPath,
        });
      });
    }
  }

  const tableCounts: Record<string, number> = {};
  for (const table of COUNT_TABLES) {
    if (![...have].some((key) => key.startsWith(`${table}.`))) continue;
    const result = await client.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ${quoteIdent(table)}`);
    tableCounts[table] = result.rows[0]?.n ?? 0;
  }

  return { references, tableCounts, missingColumns };
}

function collectStrings(value: unknown, into: string[]) {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into));
}

function bump(summary: Record<string, number>, key: string, amount = 1) {
  summary[key] = (summary[key] ?? 0) + amount;
}

async function dryRun(refresh: boolean) {
  await ensureWorkDir();
  acquireLock();
  try {
    const current = readState();
    const existing = readJsonLines<ObjectRow>(manifestPath);
    const progressed = existing.some((row) => row.status !== "pending");
    if (progressed && !refresh) {
      fail("A migration manifest already has progress. Re-run with --refresh to scan again. Destination files are not deleted.");
    }
    if (
      refresh &&
      (current.phase === "updating_references" ||
        current.phase === "completed" ||
        current.phase === "validation_complete")
    ) {
      fail("Database references are already being updated. Roll those back before refreshing the file scan.");
    }

    const summary: Record<string, number> = {};
    const source = await probeOldStorage();
    log(`Old storage API: ${source.sourceApi} (HTTP ${source.sourceApiStatus ?? "none"}).`);

    const local = await walkLocal();
    let localBytes = 0;
    for (const file of local.values()) localBytes += file.bytes;
    summary.localFiles = local.size;
    summary.localBytes = localBytes;

    const destination = destinationClient();
    const destObjects = new Map<string, number>();
    let visibility: Record<string, boolean | null> = {};
    if (!destination) {
      log("New storage was not inspected. The service key or new project URL is missing.");
    } else {
      const listed = await listDestination(destination);
      listed.objects.forEach((bytes, key) => destObjects.set(key, bytes));
      visibility = listed.visibility;
      summary.destFiles = destObjects.size;
      summary.destBytes = [...destObjects.values()].reduce((sum, bytes) => sum + Math.max(0, bytes), 0);
      for (const bucket of KNOWN_BUCKETS) {
        log(
          `Destination bucket ${bucket}: ${bucket in visibility ? `present, public=${String(visibility[bucket])}` : "missing"}.`
        );
      }
    }

    let references: ReferenceRow[] = [];
    let tableCounts: Record<string, number> = {};
    let databaseInspected = false;
    const db = databaseClient();
    if (!db) {
      log("Database was not inspected. DATABASE_URL is missing.");
    } else {
      await db.connect();
      try {
        const scanned = await scanDatabase(db);
        references = scanned.references;
        tableCounts = scanned.tableCounts;
        databaseInspected = true;
        if (scanned.missingColumns.length > 0) {
          log(`Columns not in this database: ${scanned.missingColumns.join(", ")}`);
        }
      } finally {
        await db.end();
      }
    }

    const referencedKeys = new Set<string>();
    for (const reference of references) {
      bump(summary, `refs.${reference.kind}`);
      if (reference.bucket && reference.objectPath) {
        const key = objectKey(reference.bucket, reference.objectPath);
        referencedKeys.add(key);
        if (local.has(key)) bump(summary, "referencedPresent");
        else bump(summary, "referencedMissing");
      }
    }

    const rows: ObjectRow[] = [];
    for (const [key, file] of local) {
      const slash = key.indexOf("/");
      const bucket = key.slice(0, slash);
      const objectPath = key.slice(slash + 1);
      const destBytes = destObjects.has(key) ? destObjects.get(key)! : null;
      const decision = decideObject({ bytes: file.bytes }, destBytes == null || destBytes < 0 ? null : { bytes: destBytes });
      rows.push({
        bucket,
        objectPath,
        source: "local-backup",
        sourceBytes: file.bytes,
        destBytes: destBytes != null && destBytes >= 0 ? destBytes : null,
        contentType: contentTypeForPath(objectPath),
        decision,
        status: decision === "copy" ? "pending" : decision === "skip-same-size" ? "skipped" : "failed",
        verification: decision === "skip-same-size" ? "size-match" : "none",
        attempts: 0,
        referenced: referencedKeys.has(key),
        error: decision === "conflict" ? "Destination exists with a different size. It was not overwritten." : undefined,
      });
      if (decision === "copy") bump(summary, "copyBytes", file.bytes);
      if (decision === "conflict") bump(summary, "conflicts");
      if (decision === "skip-same-size") bump(summary, "sameSize");
    }

    for (const key of referencedKeys) {
      if (local.has(key)) continue;
      const slash = key.indexOf("/");
      const bucket = key.slice(0, slash);
      const objectPath = key.slice(slash + 1);
      rows.push({
        bucket,
        objectPath,
        source: "missing",
        sourceBytes: null,
        destBytes: destObjects.has(key) ? destObjects.get(key)! : null,
        contentType: contentTypeForPath(objectPath),
        decision: "missing-source",
        status: "failed",
        verification: "none",
        attempts: 0,
        referenced: true,
        error: "Referenced by the database but absent from the local backup.",
      });
    }

    const quota = quotaDecision(summary.copyBytes ?? 0, summary.destBytes ?? 0);
    summary.quotaShortfall = quota.shortfall;
    summary.quotaAllowed = quota.allowed ? 1 : 0;

    writeJsonLines(manifestPath, rows);
    writeJsonLines(referencesPath, references);
    writeFileSync(
      summaryPath,
      `${JSON.stringify({ source, visibility, tableCounts, summary, databaseInspected, quota }, null, 2)}\n`
    );
    writeState({
      phase: "dry_run_complete",
      paused: false,
      databaseInspected,
      ...source,
      destinationPublic: visibility,
      summary,
      lastError: quota.allowed ? undefined : "Local files exceed the free storage cap. Copy was not started.",
      checkpoint: new Date().toISOString(),
    });

    log(`Dry run complete. Local files ${summary.localFiles ?? 0} (${summary.localBytes ?? 0} bytes).`);
    log(`Database references on the old project: ${summary["refs.old-public"] ?? 0}.`);
    log(`Already on the new project: ${summary["refs.already-new"] ?? 0}.`);
    log(`Private paths: ${summary["refs.private-path"] ?? 0}. Signed or private URLs left unchanged: ${summary["refs.signed-or-private"] ?? 0}.`);
    log(`Referenced files in the local backup: ${summary.referencedPresent ?? 0}. Missing: ${summary.referencedMissing ?? 0}.`);
    log(`Bytes that still need copying: ${summary.copyBytes ?? 0}. Destination bytes: ${summary.destBytes ?? 0}.`);
    if (!quota.allowed) {
      log(`Copy is blocked. The pending files exceed the ${FREE_STORAGE_LIMIT_BYTES}-byte free cap by ${quota.shortfall} bytes.`);
      log("No files were uploaded and no database values were changed.");
    }
    for (const [table, count] of Object.entries(tableCounts)) log(`Table ${table}: ${count} rows.`);
  } finally {
    releaseLock();
  }
}

function manifestByKey(rows: ObjectRow[]): Map<string, ObjectRow> {
  return new Map(rows.map((row) => [objectKey(row.bucket, row.objectPath), row]));
}

async function copyFiles(approve: boolean, withinQuota: boolean) {
  if (!approve) fail("Copy requires --approve. Run a dry run and read the summary first.");
  await ensureWorkDir();
  const state = readState();
  if (state.paused) fail("Migration is paused. Run resume, then copy --approve again.");
  if (!canStart("copy", state.phase)) fail(`Copy cannot start from ${state.phase}. Run a dry run first.`);
  if (!state.databaseInspected) fail("The last dry run did not inspect the database. Copy is refused.");
  if (state.sourceApi === "not_checked") fail("The old storage API was not probed. Run a dry run first.");
  if (state.sourceApi === "inaccessible") {
    log("Old storage API is inaccessible. Copy will read only the local backup and will not contact the old project for file bytes.");
  }

  const rows = readJsonLines<ObjectRow>(manifestPath);
  if (rows.length === 0) fail("Manifest is empty. Run a dry run first.");
  const pending = rows.filter((row) => row.decision === "copy" && (row.status === "pending" || row.status === "failed" || row.status === "copying"));
  const pendingBytes = pending.reduce((sum, row) => sum + (row.sourceBytes ?? 0), 0);
  const quota = quotaDecision(pendingBytes, state.summary.destBytes ?? 0);
  let chosenKeys: Set<string> | null = null;
  if (!quota.allowed && !withinQuota) {
    writeState({
      phase: "dry_run_complete",
      lastError: `Copy refused. Pending bytes exceed the free cap by ${quota.shortfall}.`,
    });
    fail(
      `Copy refused before any upload. Pending ${pendingBytes} bytes, remaining cap ${quota.remaining} bytes. Re-run with --approve --within-quota only if a partial copy is intended. Database references will stay unchanged.`
    );
  }
  if (!quota.allowed && withinQuota) {
    const selected = selectWithinQuota(
      pending.map((row) => ({
        key: objectKey(row.bucket, row.objectPath),
        bytes: row.sourceBytes ?? 0,
        referenced: row.referenced,
      })),
      quota.remaining
    );
    chosenKeys = new Set(selected.chosen.map((file) => file.key));
    log(`Partial copy selected ${selected.chosen.length} files (${selected.bytes} bytes). ${selected.deferred.length} files stay pending.`);
  }

  const supabase = destinationClient();
  if (!supabase) fail("Destination client is not configured for the new project.");
  acquireLock();
  writeState({ phase: "copying_files", lastError: undefined });
  let stoppedForQuota = false;
  try {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(2, pending.length) }, async () => {
      for (;;) {
        const index = cursor;
        cursor += 1;
        if (index >= pending.length || stoppedForQuota) return;
        const row = pending[index];
        const key = objectKey(row.bucket, row.objectPath);
        if (chosenKeys && !chosenKeys.has(key)) continue;
        if (readState().paused) return;
        const local = path.join(localRoot, row.bucket, ...row.objectPath.split("/"));
        if (!local.startsWith(path.join(localRoot, row.bucket))) {
          row.status = "failed";
          row.error = "Unsafe local path.";
          continue;
        }
        row.status = "copying";
        row.attempts += 1;
        try {
          const bytes = await readFile(local);
          const digest = createHash("sha256").update(bytes).digest("hex");
          let uploaded = false;
          for (let attempt = 1; attempt <= 3; attempt += 1) {
            const { error } = await supabase.storage.from(row.bucket).upload(row.objectPath, bytes, {
              contentType: row.contentType,
              upsert: false,
            });
            if (!error) {
              uploaded = true;
              break;
            }
            const message = scrubSecrets(error.message);
            if (isProjectQuotaError(message)) {
              stoppedForQuota = true;
              row.status = "failed";
              row.error = "Destination project refused the upload because its storage cap was reached.";
              return;
            }
            if (isAlreadyExistsError(message)) {
              row.status = "skipped";
              row.verification = "size-match";
              row.error = "Destination object already exists. It was not overwritten or checksum-verified.";
              uploaded = false;
              break;
            }
            if (!isTransientUploadError(message) || attempt === 3) {
              row.status = "failed";
              row.error = message.slice(0, 240);
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
          }
          if (uploaded) {
            row.status = "copied";
            row.verification = "uploaded-sha256";
            row.sha256 = digest;
            row.destBytes = bytes.length;
            row.error = undefined;
          }
        } catch (error) {
          row.status = "failed";
          row.error = scrubSecrets((error as Error).message).slice(0, 240);
        }
        if (index % 25 === 0) writeJsonLines(manifestPath, rows);
      }
    });
    await Promise.all(workers);
    writeJsonLines(manifestPath, rows);
    const blocking = rows.filter(
      (row) =>
        row.referenced &&
        row.source === "local-backup" &&
        row.decision !== "conflict" &&
        !referenceRewriteAllowed(row.verification)
    );
    const missing = rows.filter((row) => row.referenced && row.decision === "missing-source").length;
    const phase: Phase =
      !stoppedForQuota && blocking.length === 0 && missing === 0 ? "files_verified" : "copying_files";
    writeState({
      phase,
      lastError: stoppedForQuota ? "Destination storage cap was reached. Copy stopped." : undefined,
      checkpoint: new Date().toISOString(),
      summary: {
        ...state.summary,
        copied: rows.filter((row) => row.status === "copied" || row.status === "verified").length,
        failed: rows.filter((row) => row.status === "failed").length,
        skipped: rows.filter((row) => row.status === "skipped").length,
      },
    });
    log(`Copy checkpoint saved. Phase ${phase}. Referenced files still unverified: ${blocking.length}. Missing from backup: ${missing}.`);
    if (phase !== "files_verified") {
      log("Database references were not changed.");
    }
  } finally {
    releaseLock();
  }
}

async function verify(download: boolean) {
  const state = readState();
  if (!canStart("verify", state.phase)) fail(`Verify cannot start from ${state.phase}.`);
  const supabase = destinationClient();
  if (!supabase) fail("Destination client is not configured for the new project.");
  const rows = readJsonLines<ObjectRow>(manifestPath);
  acquireLock();
  try {
    if (download) {
      for (const row of rows) {
        if (row.source !== "local-backup" || !row.sha256) continue;
        const { data, error } = await supabase.storage.from(row.bucket).download(row.objectPath);
        if (error || !data) {
          row.status = "failed";
          row.error = scrubSecrets(error?.message ?? "Download failed").slice(0, 240);
          continue;
        }
        const bytes = Buffer.from(await data.arrayBuffer());
        const digest = createHash("sha256").update(bytes).digest("hex");
        if (digest === row.sha256) {
          row.status = "verified";
          row.verification = "checksum-match";
          row.error = undefined;
        } else {
          row.status = "failed";
          row.verification = "none";
          row.error = "Downloaded checksum did not match the local file. Destination was not overwritten.";
        }
      }
    }
    writeJsonLines(manifestPath, rows);
    const unverified = rows.filter(
      (row) =>
        row.referenced &&
        row.source === "local-backup" &&
        row.decision !== "conflict" &&
        !referenceRewriteAllowed(row.verification)
    ).length;
    const missing = rows.filter((row) => row.referenced && row.decision === "missing-source").length;
    const phase: Phase = unverified === 0 && missing === 0 ? "files_verified" : state.phase;
    writeState({ phase, checkpoint: new Date().toISOString() });
    log(`Verify finished. Referenced objects still not checksum-verified: ${unverified}. Phase ${phase}.`);
  } finally {
    releaseLock();
  }
}

async function rewriteReferences(approve: boolean) {
  if (!approve) fail("Rewriting database references requires --approve.");
  const state = readState();
  if (state.paused) fail("Migration is paused.");
  if (!canStart("rewrite", state.phase)) {
    fail("References can be rewritten only after file verification. Current phase does not allow it.");
  }
  const manifest = manifestByKey(readJsonLines<ObjectRow>(manifestPath));
  const eligible = (bucket: string, objectPath: string) =>
    referenceRewriteAllowed(manifest.get(objectKey(bucket, objectPath))?.verification);
  const db = databaseClient();
  if (!db) fail("DATABASE_URL is missing.");
  acquireLock();
  writeState({ phase: "updating_references" });
  let updated = 0;
  let left = 0;
  let skipped = 0;
  try {
    await db.connect();
    const targets = new Map<string, { table: string; column: string; id: string; format: "text" | "json" }>();
    for (const reference of readJsonLines<ReferenceRow>(referencesPath)) {
      if (reference.kind !== "old-public") continue;
      const column = reference.column.replace(/\[\d+\]$/, "");
      targets.set(`${reference.table}.${column}.${reference.id}`, {
        table: reference.table,
        column,
        id: reference.id,
        format: reference.column.includes("[") ? "json" : "text",
      });
    }

    for (const target of targets.values()) {
      if (readState().paused) break;
      await db.query("BEGIN");
      try {
        const current = await db.query<{ value: unknown }>(
          `SELECT ${quoteIdent(target.column)} AS value FROM ${quoteIdent(target.table)} WHERE id = $1 FOR UPDATE`,
          [target.id]
        );
        const value = current.rows[0]?.value;
        if (value == null) {
          await db.query("ROLLBACK");
          skipped += 1;
          continue;
        }
        let next: unknown = value;
        let changed = 0;
        if (target.format === "json") {
          const rewritten = rewriteJsonSelective(value, (objectPath) => eligible(KNOWN_BUCKETS[0], objectPath));
          next = rewritten.next;
          changed = rewritten.changed;
          left += rewritten.leftBlocked;
        } else {
          const classified = classifyStoredValue(String(value), "url");
          if (classified.kind === "old-public" && eligible(classified.ref.bucket, classified.ref.objectPath)) {
            next = classified.nextUrl;
            changed = 1;
          } else if (classified.kind === "old-public") {
            left += 1;
          }
        }
        if (changed === 0) {
          await db.query("ROLLBACK");
          skipped += 1;
          continue;
        }
        const previous = target.format === "json" ? JSON.stringify(value) : String(value);
        const nextText = target.format === "json" ? JSON.stringify(next) : String(next);
        if (target.format === "json") {
          await db.query(
            `UPDATE ${quoteIdent(target.table)} SET ${quoteIdent(target.column)} = $2::jsonb WHERE id = $1`,
            [target.id, nextText]
          );
        } else {
          await db.query(
            `UPDATE ${quoteIdent(target.table)} SET ${quoteIdent(target.column)} = $2 WHERE id = $1`,
            [target.id, nextText]
          );
        }
        await db.query("COMMIT");
        const snapshots = readJsonLines<SnapshotRow>(snapshotPath);
        snapshots.push({ ...target, previous, next: nextText, applied: true });
        writeJsonLines(snapshotPath, snapshots);
        updated += 1;
      } catch (error) {
        await db.query("ROLLBACK");
        writeState({ phase: "rollback_required", lastError: scrubSecrets((error as Error).message).slice(0, 240) });
        throw error;
      }
    }
    writeState({
      phase: "validation_complete",
      checkpoint: new Date().toISOString(),
      lastError: left > 0 ? `${left} references were left unchanged because their files are not verified.` : undefined,
      summary: { ...state.summary, referencesUpdated: updated, referencesLeft: left, referencesSkipped: skipped },
    });
    log(`Reference update committed ${updated} rows. Unverified references left unchanged: ${left}. Already current or skipped: ${skipped}.`);
  } finally {
    await db.end();
    releaseLock();
  }
}

async function rollbackReferences(approve: boolean, dryRun: boolean) {
  const snapshots = readJsonLines<SnapshotRow>(snapshotPath).filter((row) => row.applied);
  const gate = rollbackGate({ snapshotRows: snapshots.length, approve, dryRun });
  if (gate === "missing-snapshot") {
    fail("No applied reference snapshot exists. Rollback was not started.");
  }
  if (gate === "needs-approval") fail("Rollback requires --approve, or --dry-run to preview.");
  const state = readState();
  if (!dryRun && !canStart("rollback", state.phase)) fail(`Rollback cannot start from ${state.phase}.`);
  if (snapshots.length === 0) fail("No applied reference snapshot exists. There is nothing to restore.");
  const db = databaseClient();
  if (!db) fail("DATABASE_URL is missing.");
  acquireLock();
  let restored = 0;
  let already = 0;
  let changed = 0;
  try {
    await db.connect();
    for (const snapshot of snapshots) {
      await db.query("BEGIN");
      try {
        const current = await db.query<{ value: unknown }>(
          `SELECT ${quoteIdent(snapshot.column)} AS value FROM ${quoteIdent(snapshot.table)} WHERE id = $1${dryRun ? "" : " FOR UPDATE"}`,
          [snapshot.id]
        );
        const currentText =
          snapshot.format === "json" ? JSON.stringify(current.rows[0]?.value ?? null) : String(current.rows[0]?.value ?? "");
        const action = rollbackAction(currentText, snapshot.next, snapshot.previous);
        if (action === "already-restored") already += 1;
        else if (action === "skip-changed") changed += 1;
        else if (dryRun) restored += 1;
        else {
          if (snapshot.format === "json") {
            await db.query(
              `UPDATE ${quoteIdent(snapshot.table)} SET ${quoteIdent(snapshot.column)} = $2::jsonb WHERE id = $1`,
              [snapshot.id, snapshot.previous]
            );
          } else {
            await db.query(
              `UPDATE ${quoteIdent(snapshot.table)} SET ${quoteIdent(snapshot.column)} = $2 WHERE id = $1`,
              [snapshot.id, snapshot.previous]
            );
          }
          restored += 1;
        }
        await db.query(dryRun ? "ROLLBACK" : "COMMIT");
      } catch (error) {
        await db.query("ROLLBACK");
        writeState({ phase: "rollback_required", lastError: scrubSecrets((error as Error).message).slice(0, 240) });
        throw error;
      }
    }
    const report = { dryRun, restored, already, changed, destinationObjectsDeleted: 0 };
    await writeFile(path.join(workDir, "rollback-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    if (!dryRun) {
      writeState({ phase: changed > 0 ? "rollback_required" : "rolled_back", checkpoint: new Date().toISOString() });
    }
    log(
      dryRun
        ? `Rollback preview. Would restore ${restored}. Already previous: ${already}. Would leave later edits: ${changed}.`
        : `Rollback restored ${restored} values. Already previous: ${already}. Left alone because they changed after migration: ${changed}.`
    );
    log("No destination files were deleted. Production still uses the new project; the old project remains frozen.");
  } finally {
    await db.end();
    releaseLock();
  }
}

function printStatus() {
  const state = readState();
  log(`Phase: ${state.phase}${state.paused ? " (paused)" : ""}`);
  log(`Old storage API: ${state.sourceApi}. Database inspected: ${state.databaseInspected}.`);
  if (state.lastError) log(`Last error: ${state.lastError}`);
  if (state.checkpoint) log(`Checkpoint: ${state.checkpoint}`);
  for (const [key, value] of Object.entries(state.summary)) log(`${key}: ${value}`);
  log("Application configuration stays on the new Supabase project. This tool does not change Vercel settings.");
  log("Switching the website back to the old project would not restore files while that project is frozen.");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const approve = args.includes("--approve");
  const refresh = args.includes("--refresh");
  const withinQuota = args.includes("--within-quota");
  const download = args.includes("--download");
  const dryRunFlag = args.includes("--dry-run");
  if (!command || command === "help") {
    log("Commands: preflight, dry-run, snapshot, migrate-storage --approve, migrate-database, verify [--download], rewrite-references --approve, rollback --dry-run, rollback --approve, status, pause, resume");
    return;
  }
  if (command === "status") return printStatus();
  if (command === "pause") {
    await ensureWorkDir();
    writeState({ paused: true });
    log("Pause requested. A running copy stops after the current file. Nothing was deleted.");
    return;
  }
  if (command === "resume") {
    await ensureWorkDir();
    writeState({ paused: false });
    log("Pause cleared. Continue with copy --approve. Completed files are not uploaded again.");
    return;
  }
  if (command === "preflight") return runPreflight();
  if (command === "dry-run") return dryRun(refresh);
  if (command === "snapshot") return runDestinationSnapshot();
  if (command === "copy" || command === "migrate-storage") return copyFiles(approve, withinQuota);
  if (command === "migrate-database") return planDatabaseMigration();
  if (command === "verify") return verify(download);
  if (command === "rewrite-references") return rewriteReferences(approve);
  if (command === "rollback" || command === "rollback-references") return rollbackReferences(approve, dryRunFlag);
  fail(`Unknown command ${command}.`);
}

main().catch((error) => {
  if (process.exitCode !== 1) {
    console.error(scrubSecrets((error as Error).message));
    process.exitCode = 1;
  }
});
