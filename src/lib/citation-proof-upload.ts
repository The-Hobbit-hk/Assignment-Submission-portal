import { randomUUID } from "crypto";
import path from "path";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  assignmentInclude,
  isCitationEditable,
  serializeCitationAssignment,
} from "@/lib/citations";
import { canSubmitCitations } from "@/lib/roles";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";
import { apiError, forbidden, notFound } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const MAX_CITATION_PROOF_BYTES = 5 * 1024 * 1024;
export const MAX_CITATION_PROOF_LABEL = "5 MB";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isAllowedCitationProofFile(file: { name: string; type: string }) {
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

export function buildCitationProofObjectPath(
  userId: string,
  assignmentId: string,
  fileName: string,
  contentType: string
) {
  return `citations/proofs/${userId}/${assignmentId}/${randomUUID()}${fileExt(fileName, contentType)}`;
}

export function isOwnedCitationProofPath(
  userId: string,
  assignmentId: string,
  objectPath: string
) {
  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(`citations/proofs/${userId}/${assignmentId}/`) &&
    !objectPath.includes("..") &&
    objectPath.length < 400
  );
}

export async function assertCitationProofUploadable(session: Session, assignmentId: string) {
  if (!canSubmitCitations(session.user.role as UserRole)) {
    return { ok: false as const, response: forbidden() };
  }

  const assignment = await prisma.citationAssignment.findUnique({
    where: { id: assignmentId },
    include: assignmentInclude,
  });
  if (!assignment) {
    return { ok: false as const, response: notFound("Citation assignment not found.") };
  }
  if (session.user.clubId !== assignment.clubId) {
    return { ok: false as const, response: forbidden() };
  }
  if (assignment.status === "APPROVED") {
    return {
      ok: false as const,
      response: apiError("Approved citations cannot be edited.", 400),
    };
  }
  if (!isCitationEditable(assignment.status, assignment.dueDate)) {
    return {
      ok: false as const,
      response: apiError(
        "This citation is past its deadline and can no longer be updated.",
        400
      ),
    };
  }

  return { ok: true as const, assignment };
}

export async function attachCitationProofUrl(assignmentId: string, proofUrl: string) {
  const existing = await prisma.citationAssignment.findUnique({
    where: { id: assignmentId },
    select: { status: true },
  });
  if (!existing) throw new Error("Citation assignment not found.");

  const status =
    existing.status === "ASSIGNED" || existing.status === "REJECTED"
      ? "DRAFT"
      : existing.status;

  const updated = await prisma.citationAssignment.update({
    where: { id: assignmentId },
    data: { proofUrl, status },
    include: assignmentInclude,
  });

  return serializeCitationAssignment(updated);
}

export {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
};
