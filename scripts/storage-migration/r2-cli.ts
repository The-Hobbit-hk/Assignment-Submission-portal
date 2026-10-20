/**
 * Local historical archive → Cloudflare R2.
 * Does not upload or rewrite database rows unless migrate-storage / rewrite-references
 * are explicitly approved AND R2 credentials are configured.
 *
 *   npx tsx scripts/storage-migration/r2-cli.ts preflight
 *   npx tsx scripts/storage-migration/r2-cli.ts dry-run
 *   npx tsx scripts/storage-migration/r2-cli.ts snapshot
 *   npx tsx scripts/storage-migration/r2-cli.ts migrate-storage --approve
 *   npx tsx scripts/storage-migration/r2-cli.ts verify
 *   npx tsx scripts/storage-migration/r2-cli.ts rewrite-references --approve
 *   npx tsx scripts/storage-migration/r2-cli.ts validate
 *   npx tsx scripts/storage-migration/r2-cli.ts rollback --dry-run
 *   npx tsx scripts/storage-migration/r2-cli.ts rollback --approve
 */
import { createHash } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { missingR2Env, readR2Config } from "../../src/lib/storage/r2-config";
import { classifyStoredValue, contentTypeForPath, JSON_URL_COLUMNS, scrubSecrets, URL_COLUMNS } from "./plan";
import { historicalObjectKey, publicObjectUrl, r2UploadDecision, shouldRetryR2, type R2ManifestState } from "./r2-plan";
import pg from "pg";

loadEnv({ path: ".env.local" });
loadEnv();

const liveRoot = path.join(process.cwd(), "backups", "storage", "live");
const workDir = path.join(process.cwd(), "backups", "migration", "r2");
const manifestPath = path.join(workDir, "manifest.jsonl");
const recoveryRoot = path.join(process.cwd(), "backups", "migration", "recovery");
const referenceSnapshotPath = path.join(workDir, "reference-snapshot.jsonl");

type ManifestRow = {
  runId: string;
  sourceProvider: "local-backup";
  sourceBucket: "uploads" | "event-registrations";
  objectPath: string;
  sourceBytes: number | null;
  sourceSha256: string | null;
  destinationProvider: "r2";
  destinationBucket: string | null;
  destinationKey: string | null;
  destinationSize: number | null;
  destinationSha256: string | null;
  status: R2ManifestState;
  recordIds: string[];
  error?: string;
};

function log(message: string) {
  console.log(scrubSecrets(message));
}

function fail(message: string): never {
  console.error(scrubSecrets(message));
  process.exitCode = 1;
  throw new Error(message);
}

function walkBucket(bucket: "uploads" | "event-registrations"): { objectPath: string; bytes: number; fullPath: string }[] {
  const dir = path.join(liveRoot, bucket);
  if (!existsSync(dir)) return [];
  const files: { objectPath: string; bytes: number; fullPath: string }[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const objectPath = path.relative(dir, full).split(path.sep).join("/");
        const key = historicalObjectKey(objectPath);
        if (!key) continue;
        files.push({ objectPath: key, bytes: statSync(full).size, fullPath: full });
      }
    }
  };
  walk(dir);
  return files;
}

function latestRecovery(): { dir: string; runId: string; sha256: string; bytes: number } | null {
  if (!existsSync(recoveryRoot)) return null;
  const dirs = readdirSync(recoveryRoot).filter((name) => statSync(path.join(recoveryRoot, name)).isDirectory()).sort();
  const runId = dirs.at(-1);
  if (!runId) return null;
  const manifestFile = path.join(recoveryRoot, runId, "manifest.json");
  if (!existsSync(manifestFile)) return null;
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8")) as { runId?: string; sha256?: string; bytes?: number };
  if (!manifest.sha256 || !manifest.bytes) return null;
  return { dir: path.join(recoveryRoot, runId), runId: manifest.runId ?? runId, sha256: manifest.sha256, bytes: manifest.bytes };
}

async function verifyRecovery(): Promise<{ verified: boolean; runId: string | null }> {
  const recovery = latestRecovery();
  if (!recovery) return { verified: false, runId: null };
  const data = await readFile(path.join(recovery.dir, "data.json"));
  const actual = createHash("sha256").update(data).digest("hex");
  return { verified: actual === recovery.sha256 && data.length === recovery.bytes, runId: recovery.runId };
}

function setupInstructions() {
  log("R2 is not configured. Live upload was not started.");
  log("Create two private R2 buckets (one for historical public files, one for private files). Do not enable public bucket access on the private bucket.");
  log("Create an R2 API token limited to those two buckets, Object Read and Write.");
  log("Set these server-side variables locally and in Vercel, with no NEXT_PUBLIC_ prefix:");
  log("  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_PUBLIC, R2_BUCKET_PRIVATE");
  log("Set R2_PUBLIC_BASE_URL only after a custom domain is attached and serving the public bucket.");
  log("New website uploads use R2 as soon as those five variables are set.");
  log("Then run: npm run migrate:r2:preflight");
}

async function preflight() {
  const missing = missingR2Env();
  const uploads = walkBucket("uploads");
  const privateFiles = walkBucket("event-registrations");
  const uploadBytes = uploads.reduce((sum, file) => sum + file.bytes, 0);
  const recovery = await verifyRecovery();
  const config = missing.length === 0 ? readR2Config() : null;
  log(`R2 configuration missing: ${missing.length === 0 ? "none" : missing.join(", ")}.`);
  log(`Local uploads: ${uploads.length} files, ${uploadBytes} bytes.`);
  log(`Local event-registrations: ${existsSync(path.join(liveRoot, "event-registrations")) ? "present" : "absent"}, files ${privateFiles.length}.`);
  log(`Recovery snapshot ${recovery.runId ?? "missing"} verified: ${recovery.verified}.`);
  if (config) {
    const { createR2Client, r2BucketsReachable } = await import("../../src/lib/storage/r2-client");
    const checks = await r2BucketsReachable(createR2Client(config), config);
    for (const check of checks) log(`R2 bucket configured=${check.ok ? "reachable" : "unreachable"} (${check.error ?? "ok"}).`);
  } else {
    setupInstructions();
  }
  log("No files were uploaded and no database rows were changed.");
}

async function dryRun() {
  const uploads = walkBucket("uploads");
  const config = readR2Config();
  const runId = `r2-${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}`;
  const rows: ManifestRow[] = uploads.map((file) => {
    const destination = config ? { exists: false, sha256: null, size: null } : null;
    const decision = r2UploadDecision({ bytes: file.bytes, sha256: "" }, config ? destination : null);
    return {
      runId,
      sourceProvider: "local-backup",
      sourceBucket: "uploads",
      objectPath: file.objectPath,
      sourceBytes: file.bytes,
      sourceSha256: null,
      destinationProvider: "r2",
      destinationBucket: config?.publicBucket ?? null,
      destinationKey: file.objectPath,
      destinationSize: null,
      destinationSha256: null,
      status: config ? decision : "pending_approval",
      recordIds: [],
    };
  });
  if (!existsSync(path.join(liveRoot, "event-registrations"))) {
    rows.push({
      runId,
      sourceProvider: "local-backup",
      sourceBucket: "event-registrations",
      objectPath: "",
      sourceBytes: null,
      sourceSha256: null,
      destinationProvider: "r2",
      destinationBucket: config?.privateBucket ?? null,
      destinationKey: null,
      destinationSize: null,
      destinationSha256: null,
      status: "missing_source",
      recordIds: [],
      error: "The local private archive is absent. No registration files were invented.",
    });
  }
  await mkdir(workDir, { recursive: true });
  await writeFile(manifestPath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  const bytes = uploads.reduce((sum, file) => sum + file.bytes, 0);
  log(`Dry run ${runId}. Public files ${uploads.length}, bytes ${bytes}. Private archive missing. Checksums are computed at approved upload, not stored yet.`);
  log(`Manifest: backups/migration/r2/manifest.jsonl`);
  if (!config) log("Destination was not contacted. R2 credentials are absent, so every public file stays pending_approval.");
  log("No files were uploaded and no database rows were changed.");
}

function readManifest(): ManifestRow[] {
  if (!existsSync(manifestPath)) return [];
  return readFileSync(manifestPath, "utf8")
    .split(/\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as ManifestRow);
}

async function writeManifest(rows: ManifestRow[]) {
  await mkdir(workDir, { recursive: true });
  await writeFile(manifestPath, rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""));
}

async function migrateStorage(approve: boolean) {
  if (!approve) fail("R2 upload requires --approve.");
  const missing = missingR2Env();
  if (missing.length > 0) {
    setupInstructions();
    fail("Refusing R2 upload because credentials are not configured.");
  }
  const rows = readManifest();
  if (rows.length === 0) fail("No R2 manifest. Run dry-run first.");
  const config = readR2Config();
  if (!config) fail("R2 configuration could not be read.");
  const { createR2Client, r2HeadChecksum, r2PutVerified } = await import("../../src/lib/storage/r2-client");
  const client = createR2Client(config);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.sourceBucket !== "uploads" || !row.destinationKey || !shouldRetryR2(row.status)) continue;
    const fullPath = path.join(liveRoot, "uploads", ...row.destinationKey.split("/"));
    if (!fullPath.startsWith(path.join(liveRoot, "uploads") + path.sep)) {
      row.status = "failed";
      row.error = "Unsafe local path.";
      failed += 1;
      continue;
    }
    row.status = "uploading";
    try {
      const body = await readFile(fullPath);
      const sha256Hex = createHash("sha256").update(body).digest("hex");
      const sha256Base64 = createHash("sha256").update(body).digest("base64");
      row.sourceSha256 = sha256Hex;
      row.sourceBytes = body.length;
      const head = await r2HeadChecksum(client, config.publicBucket, row.destinationKey);
      const decision = r2UploadDecision(
        { bytes: body.length, sha256: sha256Base64 },
        head.exists ? { exists: true, sha256: head.sha256, size: head.size } : null
      );
      if (decision === "conflict") {
        row.status = "failed";
        row.error = "Destination object exists and was not overwritten.";
        failed += 1;
      } else if (decision === "skipped") {
        row.status = "verified";
        row.destinationSha256 = sha256Hex;
        row.destinationSize = body.length;
        skipped += 1;
      } else {
        await r2PutVerified({
          client,
          bucket: config.publicBucket,
          key: row.destinationKey,
          body,
          contentType: contentTypeForPath(row.destinationKey),
          sha256Base64,
        });
        const confirmed = await r2HeadChecksum(client, config.publicBucket, row.destinationKey);
        if (confirmed.sha256 === sha256Base64) {
          row.status = "verified";
          row.destinationSha256 = sha256Hex;
          row.destinationSize = confirmed.size;
          uploaded += 1;
        } else {
          row.status = "uploaded";
          row.error = "Upload returned but the destination checksum was not confirmed.";
          failed += 1;
        }
      }
    } catch (error) {
      row.status = "failed";
      row.error = scrubSecrets((error as Error).message).slice(0, 180);
      failed += 1;
    }
    const done = uploaded + skipped + failed;
    if (done > 0 && done % 25 === 0) {
      await writeManifest(rows);
      log(`Progress ${done}. Verified ${uploaded}. Already matched ${skipped}. Unconfirmed or failed ${failed}.`);
    }
  }
  await writeManifest(rows);
  log(`R2 upload finished. Verified uploads ${uploaded}. Already verified ${skipped}. Failed or unconfirmed ${failed}.`);
  log("Local files and existing destination objects were not deleted.");
}

async function verify() {
  if (missingR2Env().length > 0) fail("Cannot verify R2 objects. Credentials are not configured.");
  const rows = readManifest();
  const config = readR2Config();
  if (!config) fail("R2 configuration could not be read.");
  const { createR2Client, r2HeadChecksum } = await import("../../src/lib/storage/r2-client");
  const client = createR2Client(config);
  let verified = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.sourceBucket !== "uploads" || !row.destinationKey || !row.sourceSha256) continue;
    const expected = Buffer.from(row.sourceSha256, "hex").toString("base64");
    const head = await r2HeadChecksum(client, config.publicBucket, row.destinationKey);
    if (head.exists && head.sha256 === expected) {
      row.status = "verified";
      row.destinationSha256 = row.sourceSha256;
      row.destinationSize = head.size;
      verified += 1;
    } else {
      row.status = "failed";
      row.error = head.exists ? "Destination checksum did not match." : "Destination object is missing.";
      failed += 1;
    }
  }
  await writeManifest(rows);
  log(`Verify finished. Matched ${verified}. Failed ${failed}.`);
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) throw new Error("Unexpected identifier");
  return `"${name}"`;
}

function databaseClient(): pg.Client | null {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) return null;
  const connectionString = raw.replace(/([?&])sslmode=[^&]*/g, "$1").replace(/\?&/, "?").replace(/[?&]$/, "");
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
}

async function rewrite(approve: boolean) {
  const recovery = await verifyRecovery();
  if (!recovery.verified) fail("Reference rewrite refused (missing_recovery). No database value was changed.");
  const base = process.env.R2_PUBLIC_BASE_URL?.trim() || "";
  if (!base) fail("Reference rewrite refused. R2_PUBLIC_BASE_URL is not set. No database value was changed.");
  const verified = new Set(
    readManifest()
      .filter((row) => row.status === "verified" && row.sourceBucket === "uploads" && row.destinationKey)
      .map((row) => row.destinationKey as string)
  );
  if (verified.size === 0) fail("Reference rewrite refused (unverified). No R2 object is verified. No database value was changed.");
  if (!approve) fail("Reference rewrite refused (needs_approval). No database value was changed.");
  const db = databaseClient();
  if (!db) fail("DATABASE_URL is missing. No database value was changed.");
  let updated = 0;
  await db.connect();
  try {
    for (const [table, column] of URL_COLUMNS) {
      const result = await db.query<{ id: string; value: string }>(
        `SELECT id, ${quoteIdent(column)} AS value FROM ${quoteIdent(table)} WHERE ${quoteIdent(column)} IS NOT NULL`
      );
      for (const row of result.rows) {
        const classified = classifyStoredValue(row.value, "url");
        if (classified.kind !== "old-public" || !verified.has(classified.ref.objectPath)) continue;
        const next = publicObjectUrl(base, classified.ref.objectPath);
        if (!next) continue;
        await db.query("BEGIN");
        const written = await db.query(
          `UPDATE ${quoteIdent(table)} SET ${quoteIdent(column)} = $2 WHERE id = $1 AND ${quoteIdent(column)} = $3`,
          [row.id, next, row.value]
        );
        if ((written.rowCount ?? 0) === 0) {
          await db.query("ROLLBACK");
          continue;
        }
        await db.query("COMMIT");
        await writeFile(
          referenceSnapshotPath,
          `${JSON.stringify({ runId: recovery.runId, table, column, id: row.id, previous: row.value, next })}\n`,
          { flag: "a" }
        );
        updated += 1;
      }
    }
    for (const [table, column] of JSON_URL_COLUMNS) {
      const result = await db.query<{ id: string; value: unknown }>(
        `SELECT id, ${quoteIdent(column)} AS value FROM ${quoteIdent(table)} WHERE ${quoteIdent(column)}::text LIKE '%supabase.co%'`
      );
      for (const row of result.rows) {
        const original = JSON.stringify(row.value);
        const nextValue = JSON.parse(original) as unknown;
        let changed = false;
        const visit = (input: unknown): unknown => {
          if (typeof input === "string") {
            const classified = classifyStoredValue(input, "url");
            if (classified.kind === "old-public" && verified.has(classified.ref.objectPath)) {
              const next = publicObjectUrl(base, classified.ref.objectPath);
              if (next) {
                changed = true;
                return next;
              }
            }
          }
          if (Array.isArray(input)) return input.map(visit);
          return input;
        };
        const rewritten = visit(nextValue);
        if (!changed) continue;
        const nextText = JSON.stringify(rewritten);
        await db.query("BEGIN");
        const written = await db.query(
          `UPDATE ${quoteIdent(table)} SET ${quoteIdent(column)} = $2::jsonb WHERE id = $1 AND ${quoteIdent(column)}::text = $3`,
          [row.id, nextText, original]
        );
        if ((written.rowCount ?? 0) === 0) {
          await db.query("ROLLBACK");
          continue;
        }
        await db.query("COMMIT");
        await writeFile(
          referenceSnapshotPath,
          `${JSON.stringify({ runId: recovery.runId, table, column, id: row.id, previous: original, next: nextText })}\n`,
          { flag: "a" }
        );
        updated += 1;
      }
    }
  } finally {
    await db.end();
  }
  log(`Reference rewrite committed ${updated} rows. Unverified and external values were left unchanged.`);
}

async function validate() {
  if (!existsSync(manifestPath)) fail("No R2 manifest. Run dry-run first.");
  const rows = readFileSync(manifestPath, "utf8").split(/\n/).filter(Boolean).map((line) => JSON.parse(line) as ManifestRow);
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  for (const [status, count] of Object.entries(counts)) log(`${status}: ${count}`);
  log("Validation read the local manifest only.");
}

async function rollback(approve: boolean, dryRunFlag: boolean) {
  const rows = existsSync(referenceSnapshotPath)
    ? readFileSync(referenceSnapshotPath, "utf8").split(/\n/).filter(Boolean)
    : [];
  if (rows.length === 0) fail("No R2 reference snapshot exists. Rollback was not started.");
  if (dryRunFlag) {
    log(`Rollback preview would inspect ${rows.length} reference rows. No database value was changed and no R2 object would be deleted.`);
    return;
  }
  if (!approve) fail("Rollback requires --approve, or --dry-run to preview.");
  fail("Approved R2 reference rollback is not applied until a verified rewrite snapshot exists.");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const approve = args.includes("--approve");
  const dryRunFlag = args.includes("--dry-run");
  if (!command || command === "help") {
    log("Commands: preflight, dry-run, snapshot, migrate-storage --approve, verify, rewrite-references --approve, validate, rollback --dry-run, rollback --approve");
    return;
  }
  if (command === "preflight") return preflight();
  if (command === "dry-run") return dryRun();
  if (command === "snapshot") {
    const recovery = await verifyRecovery();
    log(`Recovery ${recovery.runId ?? "missing"} verified=${recovery.verified}. No new database export was taken.`);
    if (!recovery.verified) process.exitCode = 1;
    return;
  }
  if (command === "migrate-storage") return migrateStorage(approve);
  if (command === "verify") return verify();
  if (command === "rewrite-references") return rewrite(approve);
  if (command === "validate") return validate();
  if (command === "rollback") return rollback(approve, dryRunFlag);
  fail(`Unknown command ${command}.`);
}

main().catch((error) => {
  if (process.exitCode !== 1) {
    console.error(scrubSecrets((error as Error).message));
    process.exitCode = 1;
  }
});
