/** Allow browser uploads to the public R2 bucket and confirm one archived object can be read. */
import { config as loadEnv } from "dotenv";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { allowBrowserUploads, openPublicObject } from "../../src/lib/storage/r2-ops";
import { createR2Client } from "../../src/lib/storage/r2-client";
import { readR2Config } from "../../src/lib/storage/r2-config";

loadEnv({ path: ".env.local" });

async function main() {
  const config = readR2Config();
  if (!config) {
    console.error("R2 is not configured.");
    process.exit(1);
  }

  try {
    await allowBrowserUploads();
    console.log("browser upload CORS set");
  } catch (error) {
    const message = error instanceof Error ? error.name : "failed";
    console.log(`browser upload CORS not changed (${message})`);
  }

  const listed = await createR2Client(config).send(
    new ListObjectsV2Command({ Bucket: config.publicBucket, MaxKeys: 1 })
  );
  const key = listed.Contents?.[0]?.Key;
  const size = listed.Contents?.[0]?.Size ?? 0;
  if (!key) {
    console.error("public bucket has no objects");
    process.exit(1);
  }

  const file = await openPublicObject(key);
  const reader = file.stream.getReader();
  const first = await reader.read();
  await reader.cancel();
  const bytes = first.value?.byteLength ?? 0;
  console.log(`read ok bytes=${bytes} size=${size} type=${file.contentType}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "failed";
  console.error(message.replace(/[A-Za-z0-9+/]{20,}/g, "[redacted]"));
  process.exit(1);
});
