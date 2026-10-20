import { isSafeObjectPath } from "./plan";

export const R2_MANIFEST_STATES = [
  "discovered",
  "pending_approval",
  "uploading",
  "uploaded",
  "verified",
  "skipped",
  "failed",
  "missing_source",
  "reference_pending",
  "reference_updated",
  "rollback_eligible",
  "rollback_completed",
] as const;

export type R2ManifestState = (typeof R2_MANIFEST_STATES)[number];

export function historicalObjectKey(relativePath: string): string | null {
  if (/^https?:\/\//i.test(relativePath)) return null;
  if (!isSafeObjectPath(relativePath)) return null;
  return relativePath;
}

export function r2BucketForSource(
  sourceBucket: "uploads" | "event-registrations",
  names: { publicBucket?: string; privateBucket?: string }
): { bucket: string | null; access: "public" | "private" } {
  if (sourceBucket === "event-registrations") {
    return { bucket: names.privateBucket?.trim() || null, access: "private" };
  }
  return { bucket: names.publicBucket?.trim() || null, access: "public" };
}

export type DestinationObject = { exists: boolean; sha256: string | null; size: number | null } | null;

export function r2UploadDecision(
  source: { bytes: number; sha256: string } | null,
  destination: DestinationObject
): "missing_source" | "pending_approval" | "skipped" | "conflict" {
  if (!source) return "missing_source";
  if (!destination?.exists) return "pending_approval";
  if (destination.sha256 && destination.sha256 === source.sha256) return "skipped";
  if (destination.size != null && destination.sha256 == null && destination.size === source.bytes) return "conflict";
  return "conflict";
}

export function r2RewriteGate(input: {
  approve: boolean;
  state: R2ManifestState | string;
  recoveryVerified: boolean;
}): "apply" | "needs_approval" | "unverified" | "missing_recovery" {
  if (!input.recoveryVerified) return "missing_recovery";
  if (input.state !== "verified") return "unverified";
  if (!input.approve) return "needs_approval";
  return "apply";
}

export function shouldRetryR2(state: string): boolean {
  return state === "pending_approval" || state === "failed" || state === "uploading";
}

export function publicObjectUrl(baseUrl: string | null, objectKey: string): string | null {
  if (!baseUrl || !historicalObjectKey(objectKey)) return null;
  return `${baseUrl.replace(/\/$/, "")}/${objectKey.split("/").map(encodeURIComponent).join("/")}`;
}
