import { randomUUID } from "crypto";
import path from "path";
import type { Session } from "next-auth";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";
import { assertClubEventCreateAccess, resolveReportingClubId } from "@/lib/reporting-access";
import { isClubUser } from "@/lib/roles";
import { apiError } from "@/lib/api-errors";

export const MAX_REPORTING_EVENT_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_REPORTING_EVENT_UPLOAD_LABEL = "2 MB";

export const REPORTING_EVENT_UPLOAD_KINDS = ["minutes", "image"] as const;
export type ReportingEventUploadKind = (typeof REPORTING_EVENT_UPLOAD_KINDS)[number];

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isAllowedReportingEventFile(file: { name: string; type: string }, kind: ReportingEventUploadKind) {
  const ext = path.extname(file.name).toLowerCase();
  if (kind === "minutes") {
    return file.type === "application/pdf" || ext === ".pdf";
  }
  if (ALLOWED_MIME.has(file.type) && file.type !== "application/pdf") return true;
  return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
}

function fileExt(fileName: string, contentType: string) {
  const fromName = path.extname(fileName);
  if (fromName) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[contentType] ?? "";
}

function folderForKind(kind: ReportingEventUploadKind) {
  return kind === "minutes" ? "event-minutes" : "event-banners";
}

export function buildReportingEventObjectPath(
  userId: string,
  kind: ReportingEventUploadKind,
  fileName: string,
  contentType: string
) {
  return `${folderForKind(kind)}/${userId}/${randomUUID()}${fileExt(fileName, contentType)}`;
}

export function isOwnedReportingEventPath(
  userId: string,
  kind: ReportingEventUploadKind,
  objectPath: string
) {
  const prefix = `${folderForKind(kind)}/${userId}/`;
  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(prefix) &&
    !objectPath.includes("..") &&
    objectPath.length < 400
  );
}

export async function assertReportingEventUploadable(
  session: Session,
  requestedClubId?: string | null
) {
  const access = assertClubEventCreateAccess(session);
  if (!access.ok) {
    return { ok: false as const, response: apiError(access.error, access.status) };
  }

  const clubId = isClubUser(session.user.role)
    ? await resolveReportingClubId(session)
    : await resolveReportingClubId(session, requestedClubId);

  if (!clubId) {
    return {
      ok: false as const,
      response: apiError("A club must be selected to add an event.", 400),
    };
  }

  return { ok: true as const, clubId };
}

export function publicUrlForPath(objectPath: string) {
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
