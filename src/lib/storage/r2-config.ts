/** Server-only R2 settings. Never prefix these with NEXT_PUBLIC_. */

export const R2_REQUIRED_ENV = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_PUBLIC",
  "R2_BUCKET_PRIVATE",
] as const;

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBucket: string;
  privateBucket: string;
  publicBaseUrl: string | null;
};

export function missingR2Env(env: NodeJS.ProcessEnv = process.env): string[] {
  return R2_REQUIRED_ENV.filter((key) => !env[key]?.trim());
}

export function isR2StorageEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return missingR2Env(env).length === 0;
}

export function r2Endpoint(accountId: string): string {
  if (!/^[a-z0-9]{32}$/i.test(accountId)) {
    throw new Error("R2_ACCOUNT_ID must be the 32-character Cloudflare account id.");
  }
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

export function readR2Config(env: NodeJS.ProcessEnv = process.env): R2Config | null {
  if (missingR2Env(env).length > 0) return null;
  const accountId = env.R2_ACCOUNT_ID!.trim();
  r2Endpoint(accountId);
  const publicBaseUrl = env.R2_PUBLIC_BASE_URL?.trim() || null;
  if (publicBaseUrl && !/^https:\/\/[a-z0-9.-]+/i.test(publicBaseUrl)) {
    throw new Error("R2_PUBLIC_BASE_URL must be an https URL.");
  }
  return {
    accountId,
    accessKeyId: env.R2_ACCESS_KEY_ID!.trim(),
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!.trim(),
    publicBucket: env.R2_BUCKET_PUBLIC!.trim(),
    privateBucket: env.R2_BUCKET_PRIVATE!.trim(),
    publicBaseUrl: publicBaseUrl ? publicBaseUrl.replace(/\/$/, "") : null,
  };
}

/** New uploads use R2 whenever the server credentials and both buckets are set. */
export function uploadDestination(env: NodeJS.ProcessEnv = process.env): "supabase" | "r2" {
  return isR2StorageEnabled(env) ? "r2" : "supabase";
}

export function privateDownloadDecision(authorized: boolean): "deny" | "presign" {
  return authorized ? "presign" : "deny";
}
