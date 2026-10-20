/** Map a stored Supabase public uploads URL onto the historical R2 object. */

const PUBLIC_UPLOADS_URL =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/uploads\/([^?#]+)/i;

export function isSafeObjectKey(objectKey: string): boolean {
  if (!objectKey || objectKey.startsWith("/") || objectKey.includes("\\") || objectKey.includes("..")) {
    return false;
  }
  return objectKey.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
}

export function uploadsKeyFromStoredUrl(value: string): string | null {
  const match = PUBLIC_UPLOADS_URL.exec(value.trim());
  if (!match?.[1]) return null;
  let key = match[1];
  try {
    key = key.split("/").map((part) => decodeURIComponent(part)).join("/");
  } catch {
    return null;
  }
  return isSafeObjectKey(key) ? key : null;
}

/** Browser URL for a public archive object. Uses a custom domain when one is configured. */
export function publicFileUrl(objectKey: string): string {
  if (!isSafeObjectKey(objectKey)) {
    throw new Error("Unsafe object key.");
  }
  const encoded = objectKey.split("/").map((part) => encodeURIComponent(part)).join("/");
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (base) return `${base}/${encoded}`;
  return `/api/storage/public/${encoded}`;
}

export function resolveStoredFileUrl<T extends string | null | undefined>(value: T): T {
  if (typeof value !== "string" || value.length === 0) return value;
  const key = uploadsKeyFromStoredUrl(value);
  if (!key) return value;
  return publicFileUrl(key) as T;
}

export function rewriteFileUrls<T>(value: T): T {
  if (typeof value === "string") return resolveStoredFileUrl(value) as T;
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => rewriteFileUrls(item)) as T;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = rewriteFileUrls(child);
  }
  return copy as T;
}
