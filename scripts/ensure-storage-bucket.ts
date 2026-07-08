/**
 * Create the Supabase Storage bucket used for file uploads (reports, bluebook, events).
 *
 *   npm run db:ensure-storage
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_UPLOAD_BUCKET ?? "uploads";

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function main() {
  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  const found = existing?.find((b) => b.name === bucket || b.id === bucket);
  if (found) {
    console.log(`Storage bucket "${bucket}" already exists.`);
  } else {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIME,
    });

    if (createError) {
      console.error("Failed to create bucket:", createError.message);
      console.error(
        "\nIf createBucket is blocked, run supabase/storage-setup.sql in the Supabase SQL Editor instead."
      );
      process.exit(1);
    }

    console.log(`Created public storage bucket "${bucket}" (${ALLOWED_MIME.length} MIME types, 8MB limit).`);
  }

  const privateBucket = process.env.SUPABASE_PRIVATE_BUCKET ?? "event-registrations";
  const privateFound = existing?.find((b) => b.name === privateBucket || b.id === privateBucket);
  if (privateFound) {
    console.log(`Private bucket "${privateBucket}" already exists.`);
    return;
  }

  const { error: privateError } = await supabase.storage.createBucket(privateBucket, {
    public: false,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ALLOWED_MIME,
  });

  if (privateError) {
    console.error("Failed to create private bucket:", privateError.message);
    process.exit(1);
  }

  console.log(`Created private storage bucket "${privateBucket}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
