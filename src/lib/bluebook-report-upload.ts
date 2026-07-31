import { randomUUID } from "crypto";
import path from "path";
import type { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getOrCreateCycle, serializeReport } from "@/lib/bluebook-cycle";
import {
  isAllowedBluebookFile,
  isCycleOpen,
  MAX_BLUEBOOK_UPLOAD_BYTES,
  MAX_BLUEBOOK_UPLOAD_LABEL,
} from "@/lib/bluebook-labels";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";
import { COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, DISTRICT_ROLES } from "@/lib/roles";
import { isSubmissionWindowsBypassEnabled } from "@/lib/submission-windows";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";

export async function requireBluebookUploader() {
  return requireRole([...COUNCIL_BLUEBOOK_PARTICIPANT_ROLES, ...DISTRICT_ROLES]);
}

type UploadGate =
  | { ok: true; cycleId: string; existingProofUrls: string[] }
  | { ok: false; response: NextResponse };

export async function assertBluebookReportUploadable(
  session: Session,
  month: number,
  year: number
): Promise<UploadGate> {
  const cycle = await getOrCreateCycle(prisma, month, year);

  if (
    !isSubmissionWindowsBypassEnabled() &&
    (!cycle.isActive || !isCycleOpen(cycle.closesAt, cycle.opensAt))
  ) {
    return {
      ok: false,
      response: forbidden(
        "Submission window is closed. Blue Book submissions are only accepted until the last day of the month."
      ),
    };
  }

  const existing = await prisma.councilBluebookReport.findUnique({
    where: { cycleId_assigneeId: { cycleId: cycle.id, assigneeId: session.user.id } },
  });

  if (existing && existing.status !== "DRAFT") {
    return {
      ok: false,
      response: forbidden("Submission is locked. Contact the District Secretary to reopen."),
    };
  }

  return {
    ok: true,
    cycleId: cycle.id,
    existingProofUrls: (existing?.proofUrls as string[] | null) ?? [],
  };
}

export function bluebookObjectExt(fileName: string, contentType: string) {
  const fromName = path.extname(fileName);
  if (fromName) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[contentType] ?? "";
}

export function buildBluebookObjectPath(userId: string, fileName: string, contentType: string) {
  const ext = bluebookObjectExt(fileName, contentType);
  return `bluebook-reports/${userId}/${randomUUID()}${ext}`;
}

export function isOwnedBluebookObjectPath(userId: string, objectPath: string) {
  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(`bluebook-reports/${userId}/`) &&
    !objectPath.includes("..") &&
    objectPath.length < 400
  );
}

export async function attachBluebookProofUrl(
  cycleId: string,
  assigneeId: string,
  proofUrl: string,
  existingProofUrls: string[]
) {
  const proofUrls = [...existingProofUrls, proofUrl];
  return prisma.councilBluebookReport.upsert({
    where: { cycleId_assigneeId: { cycleId, assigneeId } },
    create: {
      cycleId,
      assigneeId,
      proofUrls,
      status: "DRAFT",
    },
    update: { proofUrls },
    include: { cycle: true, assignee: { select: { id: true, name: true, email: true } } },
  });
}

export {
  serializeReport,
  handleRouteError,
  apiError,
  forbidden,
  MAX_BLUEBOOK_UPLOAD_BYTES,
  MAX_BLUEBOOK_UPLOAD_LABEL,
  isAllowedBluebookFile,
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
};
