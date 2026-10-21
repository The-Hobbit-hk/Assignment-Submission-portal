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

/** Folders shown on the public site. Every other archive file requires a signed-in user. */
const ANONYMOUS_FILE_PREFIXES = [
  "events/banners/",
  "events/gallery/",
  "event-banners/",
  "club-logos/",
];

export function isAnonymousFileKey(objectKey: string): boolean {
  return ANONYMOUS_FILE_PREFIXES.some((prefix) => objectKey.startsWith(prefix));
}

/** Registration identity and payment files are never served from the public route. */
export function isBlockedFileKey(objectKey: string): boolean {
  return objectKey.startsWith("event-registrations/") || objectKey.startsWith("private-uploads/");
}

/** Same-origin file address. Direct R2 links are never given to the browser. */
export function publicFileUrl(objectKey: string): string {
  if (!isSafeObjectKey(objectKey)) {
    throw new Error("Unsafe object key.");
  }
  const encoded = objectKey.split("/").map((part) => encodeURIComponent(part)).join("/");
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
