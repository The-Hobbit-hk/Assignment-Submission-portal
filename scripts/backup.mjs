/**
 * Orchestrates a full production backup to local disk:
 *   1. Database  (scripts/backup-db.ts)   → backups/db/<timestamp>/
 *   2. Storage   (scripts/backup-storage.ts) → backups/storage/<timestamp>/
 * then prunes old backups, keeping the most recent BACKUP_RETENTION (default 14).
 *
 *   npm run backup
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const RETENTION = parseInt(process.env.BACKUP_RETENTION ?? "14", 10);

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}`;
}

const BACKUP_TS = timestamp();
const env = { ...process.env, BACKUP_TS };

function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync("npx", args, { stdio: "inherit", shell: true, env });
  if (res.status !== 0) {
    console.warn(`! ${label} exited with code ${res.status}`);
  }
  return res.status === 0;
}

function prune(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir)
    .map((name) => ({ name, full: path.join(dir, name) }))
    .filter((e) => statSync(e.full).isDirectory())
    .sort((a, b) => b.name.localeCompare(a.name)); // newest first (timestamped names)

  const toDelete = entries.slice(RETENTION);
  for (const e of toDelete) {
    rmSync(e.full, { recursive: true, force: true });
    console.log(`  · pruned old backup: ${path.relative(process.cwd(), e.full)}`);
  }
}

console.log(`\nFull backup @ ${BACKUP_TS} (retention: ${RETENTION})`);

const dbOk = run("Database", ["tsx", "scripts/backup-db.ts"]);
const storageOk = run("Storage", ["tsx", "scripts/backup-storage.ts"]);

console.log("\n=== Pruning old backups ===");
prune(path.join(process.cwd(), "backups", "db"));
prune(path.join(process.cwd(), "backups", "storage"));

console.log(
  `\nBackup finished. Database: ${dbOk ? "OK" : "FAILED"} · Storage: ${storageOk ? "OK" : "FAILED"}`
);

if (!dbOk) process.exit(1);
