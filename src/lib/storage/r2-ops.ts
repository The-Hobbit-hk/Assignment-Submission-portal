import { GetObjectCommand, PutBucketCorsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isR2StorageEnabled, readR2Config, type R2Config } from "./r2-config";
import { createR2Client } from "./r2-client";
import { isSafeObjectKey, publicFileUrl } from "./public-url";

function requireConfig(): R2Config {
  const config = readR2Config();
  if (!config) throw new Error("R2 is not configured.");
  return config;
}

export function isR2Ready(): boolean {
  return isR2StorageEnabled();
}

export async function presignPublicPut(objectKey: string, contentType: string): Promise<string> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  const client = createR2Client(config);
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.publicBucket,
      Key: objectKey,
      ContentType: contentType || "application/octet-stream",
    }),
    { expiresIn: 10 * 60 }
  );
}

export async function openPublicObject(objectKey: string): Promise<{
  stream: ReadableStream;
  contentType: string;
  contentLength: number | null;
}> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  const response = await createR2Client(config).send(
    new GetObjectCommand({ Bucket: config.publicBucket, Key: objectKey })
  );
  if (!response.Body) throw new Error("File not found.");
  return {
    stream: response.Body.transformToWebStream(),
    contentType: response.ContentType || "application/octet-stream",
    contentLength: response.ContentLength ?? null,
  };
}

export async function presignPublicGet(objectKey: string): Promise<string> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  const client = createR2Client(config);
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.publicBucket, Key: objectKey }),
    { expiresIn: 60 * 60 }
  );
}

export async function putPublicObject(objectKey: string, body: Buffer, contentType: string): Promise<void> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  await createR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.publicBucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function putPrivateObject(objectKey: string, body: Buffer, contentType: string): Promise<void> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  await createR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.privateBucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function readPrivateObject(objectKey: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (!isSafeObjectKey(objectKey)) throw new Error("Unsafe object key.");
  const config = requireConfig();
  const response = await createR2Client(config).send(
    new GetObjectCommand({ Bucket: config.privateBucket, Key: objectKey })
  );
  if (!response.Body) throw new Error("File not found.");
  return {
    buffer: Buffer.from(await response.Body.transformToByteArray()),
    contentType: response.ContentType || "application/octet-stream",
  };
}

export async function signPublicUpload(objectKey: string, contentType: string) {
  const signedUrl = await presignPublicPut(objectKey, contentType);
  return {
    path: objectKey,
    token: "r2",
    signedUrl,
    publicUrl: publicFileUrl(objectKey),
  };
}

export async function allowBrowserUploads(): Promise<void> {
  const config = requireConfig();
  const client = createR2Client(config);
  await client.send(
    new PutBucketCorsCommand({
      Bucket: config.publicBucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [
              "https://www.rotaractdistrict3131.org",
              "https://rotaractdistrict3131.org",
              "https://rotaractweb.vercel.app",
              "http://localhost:3000",
            ],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );
}
