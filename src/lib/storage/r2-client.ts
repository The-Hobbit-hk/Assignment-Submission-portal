import { HeadBucketCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readR2Config, r2Endpoint, type R2Config } from "./r2-config";

export function createR2Client(config: R2Config = readR2Config()!): S3Client {
  if (!config) throw new Error("R2 is not configured.");
  return new S3Client({
    region: "auto",
    endpoint: r2Endpoint(config.accountId),
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function r2BucketsReachable(client: S3Client, config: R2Config): Promise<{ bucket: string; ok: boolean; error?: string }[]> {
  const results = [];
  for (const bucket of [config.publicBucket, config.privateBucket]) {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      results.push({ bucket, ok: true });
    } catch (error) {
      results.push({ bucket, ok: false, error: (error as Error).name || "HeadBucketFailed" });
    }
  }
  return results;
}

export async function r2HeadChecksum(client: S3Client, bucket: string, key: string): Promise<{ exists: boolean; sha256: string | null; size: number | null }> {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key, ChecksumMode: "ENABLED" }));
    return {
      exists: true,
      sha256: head.ChecksumSHA256 ?? null,
      size: typeof head.ContentLength === "number" ? head.ContentLength : null,
    };
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === "NotFound" || name === "NoSuchKey") return { exists: false, sha256: null, size: null };
    throw error;
  }
}

export async function r2PutVerified(input: {
  client: S3Client;
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
  sha256Base64: string;
}): Promise<void> {
  await input.client.send(
    new PutObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ChecksumAlgorithm: "SHA256",
      ChecksumSHA256: input.sha256Base64,
    })
  );
}
