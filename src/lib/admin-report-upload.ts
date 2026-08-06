import { randomUUID } from "crypto";
import path from "path";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { serializeMonthlyReport } from "@/lib/reporting";
import { assertClubReportingAccess, requireReportingClubId } from "@/lib/reporting-access";
import { upsertMonthlyReport } from "@/lib/reporting-store";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";
import { apiError } from "@/lib/api-errors";

export const ADMIN_REPORT_FIELDS = [
  "resolution",
  "districtDues",
  "bylaws",
  "masterBudget",
] as const;

export type AdminReportUploadField = (typeof ADMIN_REPORT_FIELDS)[number];

export const MAX_ADMIN_REPORT_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_ADMIN_REPORT_UPLOAD_LABEL = "5 MB";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isAllowedAdminReportFile(file: { name: string; type: string }) {
  if (ALLOWED_MIME.has(file.type)) return true;
  const ext = path.extname(file.name).toLowerCase();
  return [".pdf", ".jpg", ".jpeg", ".png", ".webp"].includes(ext);
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

export function buildAdminReportObjectPath(
  userId: string,
  fileName: string,
  contentType: string
) {
  return `admin-reporting/${userId}/${randomUUID()}${fileExt(fileName, contentType)}`;
}

export function isOwnedAdminReportObjectPath(userId: string, objectPath: string) {
  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(`admin-reporting/${userId}/`) &&
    !objectPath.includes("..") &&
    objectPath.length < 400
  );
}

export function fileUpdateForField(field: AdminReportUploadField, url: string) {
  if (field === "resolution") return { resolutionFileUrl: url };
  if (field === "districtDues") return { districtDuesFileUrl: url };
  if (field === "bylaws") return { bylawsFileUrl: url };
  return { masterBudgetFileUrl: url };
}

export async function resolveAdminReportUploadContext(
  session: Session,
  month: number,
  year: number,
  clubIdParam: string | null
) {
  const access = await assertClubReportingAccess(session, month, year);
  if (!access.ok) {
    return { ok: false as const, response: apiError(access.error, access.status) };
  }

  const clubResolved = await requireReportingClubId(session, clubIdParam);
  if (!clubResolved.ok) {
    return {
      ok: false as const,
      response: apiError(clubResolved.error, clubResolved.status),
    };
  }

  return { ok: true as const, clubId: clubResolved.clubId };
}

export async function attachAdminReportFileUrl(
  session: Session,
  month: number,
  year: number,
  clubId: string,
  field: AdminReportUploadField,
  url: string
) {
  const report = await upsertMonthlyReport(
    prisma,
    "ADMIN",
    { month, year, clubId },
    {
      submittedBy: { connect: { id: session.user.id } },
      ...fileUpdateForField(field, url),
    }
  );
  return serializeMonthlyReport(report);
}

export {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
};
