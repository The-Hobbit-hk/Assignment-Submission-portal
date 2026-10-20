/** Pure decisions for the storage migration. No network, disk, or secrets. */

export const OLD_PROJECT_REF = "xtojaphqdxdrrodskqar";
export const NEW_PROJECT_REF = "fgryedvsunlmgbiuqoit";

/** Supabase free-plan file storage cap. The local backup is larger than this. */
export const FREE_STORAGE_LIMIT_BYTES = 1_000_000_000;

export const PUBLIC_BUCKET = "uploads";
export const PRIVATE_BUCKET = "event-registrations";
export const KNOWN_BUCKETS = [PUBLIC_BUCKET, PRIVATE_BUCKET] as const;

export const URL_COLUMNS = [
  ["CitationAssignment", "proofUrl"],
  ["MonthlyReport", "resolutionFileUrl"],
  ["MonthlyReport", "districtDuesFileUrl"],
  ["MonthlyReport", "bylawsFileUrl"],
  ["MonthlyReport", "masterBudgetFileUrl"],
  ["Member", "duesProofUrl"],
  ["Member", "avatar"],
  ["User", "image"],
  ["Club", "logo"],
  ["Event", "bannerUrl"],
  ["Event", "minutesPdfUrl"],
  ["Event", "registrationUrl"],
  ["EventGallery", "url"],
  ["CouncilBluebookAssignment", "proofUrl"],
  ["BluebookSubmission", "proofUrl"],
] as const;

export const JSON_URL_COLUMNS = [["CouncilBluebookReport", "proofUrls"]] as const;

export const PRIVATE_PATH_COLUMNS = [
  ["PublicEventRegistration", "paymentProofPath"],
  ["PublicEventRegistration", "governmentIdPath"],
] as const;

export const PHASES = [
  "not_started",
  "dry_run_complete",
  "ready_for_approval",
  "copying_files",
  "files_verified",
  "updating_references",
  "validation_complete",
  "completed",
  "failed",
  "rolled_back",
  "rollback_required",
] as const;

export type Phase = (typeof PHASES)[number];

export type StorageRef = {
  projectRef: string;
  bucket: string;
  objectPath: string;
  access: "public" | "sign" | "authenticated";
};

export type Classified =
  | { kind: "old-public"; ref: StorageRef; nextUrl: string }
  | { kind: "already-new"; ref: StorageRef }
  | { kind: "signed-or-private"; ref: StorageRef }
  | { kind: "other-project"; ref: StorageRef }
  | { kind: "external" }
  | { kind: "app-path" }
  | { kind: "private-path"; bucket: typeof PRIVATE_BUCKET; objectPath: string }
  | { kind: "empty" }
  | { kind: "unsafe" };

const STORAGE_URL =
  /^https:\/\/([a-z0-9-]+)\.supabase\.co\/storage\/v1\/object\/(public|sign|authenticated)\/([a-z0-9._-]+)\/([^?#]*)/i;

export function isSafeObjectPath(objectPath: string): boolean {
  if (!objectPath || objectPath.startsWith("/") || objectPath.includes("\\")) return false;
  const parts = objectPath.split("/");
  return parts.every((part) => part.length > 0 && part !== "." && part !== "..");
}

export function parseSupabaseObjectUrl(value: string): StorageRef | null {
  const match = STORAGE_URL.exec(value.trim());
  if (!match) return null;
  let objectPath = match[4] ?? "";
  try {
    objectPath = objectPath.split("/").map((part) => decodeURIComponent(part)).join("/");
  } catch {
    return null;
  }
  if (!isSafeObjectPath(objectPath)) return null;
  const access = match[2].toLowerCase();
  if (access !== "public" && access !== "sign" && access !== "authenticated") return null;
  return {
    projectRef: match[1].toLowerCase(),
    bucket: match[3],
    objectPath,
    access,
  };
}

export function publicObjectUrl(projectRef: string, bucket: string, objectPath: string): string {
  const encoded = objectPath.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${encoded}`;
}

export function classifyStoredValue(value: string | null | undefined, columnKind: "url" | "private-path"): Classified {
  if (value == null || value.trim() === "") return { kind: "empty" };
  const trimmed = value.trim();

  const ref = parseSupabaseObjectUrl(trimmed);
  if (ref) {
    const known = (KNOWN_BUCKETS as readonly string[]).includes(ref.bucket);
    if (!known) return { kind: "other-project", ref };
    if (ref.access !== "public" || ref.bucket !== PUBLIC_BUCKET) {
      return { kind: "signed-or-private", ref };
    }
    if (ref.projectRef === NEW_PROJECT_REF) return { kind: "already-new", ref };
    if (ref.projectRef !== OLD_PROJECT_REF) return { kind: "other-project", ref };
    return {
      kind: "old-public",
      ref,
      nextUrl: publicObjectUrl(NEW_PROJECT_REF, ref.bucket, ref.objectPath),
    };
  }

  if (/^https?:\/\//i.test(trimmed)) return { kind: "external" };
  if (trimmed.startsWith("/uploads/")) return { kind: "app-path" };

  if (columnKind === "private-path") {
    const objectPath = trimmed.replace(/^\/+/, "");
    if (!isSafeObjectPath(objectPath)) return { kind: "unsafe" };
    return { kind: "private-path", bucket: PRIVATE_BUCKET, objectPath };
  }

  return { kind: "external" };
}

export function rewriteJsonValue(value: unknown): { next: unknown; changed: string[]; blocked: string[] } {
  const changed: string[] = [];
  const blocked: string[] = [];

  function visit(input: unknown): unknown {
    if (typeof input === "string") {
      const classified = classifyStoredValue(input, "url");
      if (classified.kind === "old-public") {
        changed.push(classified.ref.objectPath);
        return classified.nextUrl;
      }
      if (classified.kind === "signed-or-private" && classified.ref.projectRef === OLD_PROJECT_REF) {
        blocked.push(classified.ref.objectPath);
      }
      return input;
    }
    if (Array.isArray(input)) return input.map(visit);
    return input;
  }

  return { next: visit(value), changed, blocked };
}

/** Replace only old public URLs whose object has been verified. Everything else stays as stored. */
export function rewriteJsonSelective(
  value: unknown,
  eligible: (objectPath: string) => boolean
): { next: unknown; changed: number; leftBlocked: number } {
  let changed = 0;
  let leftBlocked = 0;

  function visit(input: unknown): unknown {
    if (typeof input === "string") {
      const classified = classifyStoredValue(input, "url");
      if (classified.kind !== "old-public") return input;
      if (!eligible(classified.ref.objectPath)) {
        leftBlocked += 1;
        return input;
      }
      changed += 1;
      return classified.nextUrl;
    }
    if (Array.isArray(input)) return input.map(visit);
    return input;
  }

  return { next: visit(value), changed, leftBlocked };
}

export type ObjectDecision = "missing-source" | "copy" | "skip-same-size" | "conflict";

export function decideObject(
  source: { bytes: number } | null,
  dest: { bytes: number } | null
): ObjectDecision {
  if (!source) return "missing-source";
  if (!dest) return "copy";
  if (dest.bytes === source.bytes) return "skip-same-size";
  return "conflict";
}

export function quotaDecision(
  pendingBytes: number,
  destBytes: number,
  limit = FREE_STORAGE_LIMIT_BYTES
): { allowed: boolean; shortfall: number; remaining: number } {
  const remaining = Math.max(0, limit - destBytes);
  const shortfall = Math.max(0, pendingBytes - remaining);
  return { allowed: shortfall === 0, shortfall, remaining };
}

export type CandidateFile = { key: string; bytes: number; referenced: boolean };

export function selectWithinQuota(files: CandidateFile[], remaining: number): {
  chosen: CandidateFile[];
  deferred: CandidateFile[];
  bytes: number;
} {
  const ordered = [...files].sort(
    (a, b) => Number(b.referenced) - Number(a.referenced) || a.bytes - b.bytes || a.key.localeCompare(b.key)
  );
  const chosen: CandidateFile[] = [];
  const deferred: CandidateFile[] = [];
  let bytes = 0;
  for (const file of ordered) {
    if (file.bytes >= 0 && bytes + file.bytes <= remaining) {
      chosen.push(file);
      bytes += file.bytes;
    } else {
      deferred.push(file);
    }
  }
  return { chosen, deferred, bytes };
}

export function referenceRewriteAllowed(verification: string | undefined): boolean {
  return verification === "uploaded-sha256" || verification === "checksum-match";
}

export type RollbackAction = "restore" | "skip-changed" | "already-restored";

export function rollbackAction(current: string, migrated: string, previous: string): RollbackAction {
  if (current === previous) return "already-restored";
  if (current === migrated) return "restore";
  return "skip-changed";
}

export function canStart(
  command: "copy" | "verify" | "rewrite" | "rollback",
  phase: Phase
): boolean {
  const allowed: Record<typeof command, Phase[]> = {
    copy: ["dry_run_complete", "ready_for_approval", "copying_files", "failed"],
    verify: ["copying_files", "files_verified", "failed"],
    rewrite: ["files_verified"],
    rollback: ["updating_references", "validation_complete", "completed", "rollback_required", "failed"],
  };
  return allowed[command].includes(phase);
}

export function contentTypeForPath(objectPath: string): string {
  const ext = objectPath.slice(objectPath.lastIndexOf(".")).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return types[ext] ?? "application/octet-stream";
}

export function isTransientUploadError(message: string): boolean {
  return /fetch failed|timeout|502|503|504|network|econnreset|etimedout/i.test(message);
}

export function isProjectQuotaError(message: string): boolean {
  return /exceed_storage_size_quota|restricted due to the following violations|storage size limit/i.test(message);
}

export function isAlreadyExistsError(message: string): boolean {
  return /already exists|duplicate/i.test(message);
}

export function scrubSecrets(value: string): string {
  return value
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}/g, "[redacted]")
    .replace(/postgresql:\/\/[^\s]+/gi, "[redacted]");
}
