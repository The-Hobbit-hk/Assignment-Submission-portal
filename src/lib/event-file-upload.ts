import { randomUUID } from "crypto";
import path from "path";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";

export const EVENT_FILE_KINDS = ["banner", "minutes", "gallery"] as const;
export type EventFileKind = (typeof EVENT_FILE_KINDS)[number];

export const MAX_EVENT_FILE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_EVENT_FILE_UPLOAD_LABEL = "5 MB";

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export function isAllowedEventFile(file: { name: string; type: string }, kind: EventFileKind) {
  const ext = path.extname(file.name).toLowerCase();
  const type = (file.type || "").toLowerCase();

  if (kind === "minutes") {
    return type === "application/pdf" || ext === ".pdf";
  }

  if (IMAGE_MIME.has(type) || type === "image/jpg") return true;
  return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
}

function fileExt(fileName: string, contentType: string) {
  const fromName = path.extname(fileName);
  if (fromName) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[contentType] ?? "";
}

function folderForKind(kind: EventFileKind) {
  if (kind === "minutes") return "events/minutes";
  if (kind === "gallery") return "events/gallery";
  return "events/banners";
}

export function buildEventFileObjectPath(
  userId: string,
  eventId: string,
  kind: EventFileKind,
  fileName: string,
  contentType: string
) {
  return `${folderForKind(kind)}/${userId}/${eventId}/${randomUUID()}${fileExt(fileName, contentType)}`;
}

export function isOwnedEventFilePath(
  userId: string,
  eventId: string,
  kind: EventFileKind,
  objectPath: string
) {
  const prefix = `${folderForKind(kind)}/${userId}/${eventId}/`;
  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(prefix) &&
    !objectPath.includes("..") &&
    objectPath.length < 400
  );
}

export function publicUrlForEventPath(objectPath: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = supabase.storage.from(SUPABASE_UPLOAD_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
};
