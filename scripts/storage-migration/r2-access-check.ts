/** Confirm R2 objects cannot be downloaded without credentials. Prints status codes only. */
import { config as loadEnv } from "dotenv";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createR2Client } from "../../src/lib/storage/r2-client";
import { readR2Config, r2Endpoint } from "../../src/lib/storage/r2-config";

loadEnv({ path: ".env.local" });

async function unsignedStatus(bucket: string, key: string) {
  const config = readR2Config();
  if (!config) throw new Error("R2 is not configured.");
  const encoded = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`${r2Endpoint(config.accountId)}/${bucket}/${encoded}`);
  const type = response.headers.get("content-type") ?? "";
  return { status: response.status, type: type.split(";")[0] };
}

async function main() {
  const config = readR2Config();
  if (!config) {
    console.error("R2 is not configured.");
    process.exit(1);
  }
  const listed = await createR2Client(config).send(
    new ListObjectsV2Command({ Bucket: config.publicBucket, MaxKeys: 1 })
  );
  const key = listed.Contents?.[0]?.Key;
  if (!key) {
    console.error("public bucket has no objects");
    process.exit(1);
  }
  const publicResult = await unsignedStatus(config.publicBucket, key);
  const privateResult = await unsignedStatus(config.privateBucket, "event-registrations/probe.pdf");
  console.log(
    `unsigned public=${publicResult.status} ${publicResult.type} private=${privateResult.status} ${privateResult.type}`
  );
  if (publicResult.status === 200 || privateResult.status === 200) process.exit(1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.name : "failed";
  console.error(message);
  process.exit(1);
});
