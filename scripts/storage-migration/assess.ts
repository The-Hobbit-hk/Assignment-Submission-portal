/** Decisions for backup preflight. No disk, network, or secrets. */

export { rollbackAction } from "./plan";

export type SnapshotFile = { name: string; bytes: number };

export type SnapshotAssessment = {
  status: "empty" | "usable";
  usable: SnapshotFile[];
};

const SNAPSHOT_NAMES = new Set(["data.json", "public.sql", "schema.sql", "data.sql"]);

export function assessSnapshotFiles(files: SnapshotFile[]): SnapshotAssessment {
  const usable = files.filter((file) => file.bytes > 0 && SNAPSHOT_NAMES.has(file.name));
  return { status: usable.length > 0 ? "usable" : "empty", usable };
}

export type SyncEntry = {
  at: string;
  downloaded: number;
  skipped: number;
  failed: number;
  remoteObjects: number;
};

export type SyncAssessment = {
  lastVerifiedRemoteAt: string | null;
  lastVerifiedRemoteObjects: number;
  lastVerifiedSkipped: number;
  runsAfterLastSuccess: number;
  zeroRemoteRunsAfter: number;
  ambiguousAfterLastSuccess: boolean;
};

export function interpretSyncLog(entries: SyncEntry[]): SyncAssessment {
  const good = entries.filter((entry) => entry.remoteObjects > 0 && entry.failed === 0);
  const last = good.at(-1) ?? null;
  const after = last ? entries.filter((entry) => entry.at > last.at) : entries;
  const zeroRemoteRunsAfter = after.filter((entry) => entry.remoteObjects === 0).length;
  return {
    lastVerifiedRemoteAt: last?.at ?? null,
    lastVerifiedRemoteObjects: last?.remoteObjects ?? 0,
    lastVerifiedSkipped: last?.skipped ?? 0,
    runsAfterLastSuccess: after.length,
    zeroRemoteRunsAfter,
    ambiguousAfterLastSuccess: zeroRemoteRunsAfter > 0,
  };
}

export type DatabaseDecision = "refuse-empty-snapshot" | "keep-destination" | "needs-approval";

export function databaseRestoreDecision(input: {
  snapshotStatus: "empty" | "usable";
  destinationRows: number;
  approve: boolean;
}): DatabaseDecision {
  if (input.snapshotStatus !== "usable") return "refuse-empty-snapshot";
  if (input.destinationRows > 0) return "keep-destination";
  if (!input.approve) return "needs-approval";
  return "needs-approval";
}

export function checksumStatus(localHash: string, downloadedHash: string): "checksum-match" | "checksum-mismatch" {
  return localHash === downloadedHash ? "checksum-match" : "checksum-mismatch";
}

export function shouldRetryUpload(status: string): boolean {
  return status === "pending" || status === "failed" || status === "copying";
}

export function referenceWriteGate(input: { approve: boolean; verification: string | undefined }): "apply" | "needs-approval" | "unverified" {
  const verified = input.verification === "uploaded-sha256" || input.verification === "checksum-match";
  if (!verified) return "unverified";
  if (!input.approve) return "needs-approval";
  return "apply";
}

export type RollbackGate = "missing-snapshot" | "preview" | "needs-approval" | "apply";

export function rollbackGate(input: { snapshotRows: number; approve: boolean; dryRun: boolean }): RollbackGate {
  if (input.snapshotRows <= 0) return "missing-snapshot";
  if (input.dryRun) return "preview";
  if (!input.approve) return "needs-approval";
  return "apply";
}

export function quotaStopsBeforeUpload(pendingBytes: number, destBytes: number, limit: number): boolean {
  return pendingBytes + destBytes > limit;
}
