/**
 * Back up Supabase Storage buckets (uploaded files) to local disk.
 *
 * Mirrors every object in the public `uploads` bucket and the private
 * `event-registrations` bucket into backups/storage/<timestamp>/<bucket>/.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (same key used on Vercel).
 *
 *   npm run backup:storage
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Storage backup skipped: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKETS = [
  process.env.SUPABASE_UPLOAD_BUCKET ?? "uploads",
  process.env.SUPABASE_PRIVATE_BUCKET ?? "event-registrations",
];

const ts = process.env.BACKUP_TS ?? timestamp();
const rootDir = path.join(process.cwd(), "backups", "storage", ts);

function timestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}`;
}

const PAGE = 100;

async function listAllObjects(bucket: string, prefix = ""): Promise<string[]> {
  const results: string[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });

    if (error) {
      throw new Error(`Failed to list ${bucket}/${prefix}: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Supabase marks folders with a null id (no metadata).
      if (entry.id === null) {
        results.push(...(await listAllObjects(bucket, full)));
      } else {
        results.push(full);
      }
    }

    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return results;
}

async function backupBucket(bucket: string): Promise<number> {
  console.log(`→ Bucket "${bucket}"…`);
  let objects: string[];
  try {
    objects = await listAllObjects(bucket);
  } catch (err) {
    console.warn(`  ! Skipped: ${(err as Error).message}`);
    return 0;
  }

  let saved = 0;
  for (const objectPath of objects) {
    const { data, error } = await supabase.storage.from(bucket).download(objectPath);
    if (error || !data) {
      console.warn(`  ! Failed to download ${objectPath}: ${error?.message ?? "no data"}`);
      continue;
    }
    const dest = path.join(rootDir, bucket, objectPath);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, Buffer.from(await data.arrayBuffer()));
    saved += 1;
  }
  console.log(`  ✓ ${saved}/${objects.length} object(s) saved.`);
  return saved;
}

async function main() {
  mkdirSync(rootDir, { recursive: true });
  console.log(`\nStorage backup → ${path.relative(process.cwd(), rootDir)}\n`);

  let total = 0;
  for (const bucket of BUCKETS) {
    total += await backupBucket(bucket);
  }

  console.log(`\nDone. ${total} file(s) backed up across ${BUCKETS.length} bucket(s).\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
