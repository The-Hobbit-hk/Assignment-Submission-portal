import type { BluebookSubmissionStatus } from "@/generated/prisma/client";
import { isSubmissionWindowsBypassEnabled } from "@/lib/submission-windows";

/** User-facing task status labels aligned with the Blue Book spec. */
export function taskStatusLabel(status: BluebookSubmissionStatus | string): string {
  switch (status) {
    case "DRAFT":
      return "Pending";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Reviewed";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
}

/** Member-facing outcome after District Secretary marks Complete / Incomplete. */
export function memberTaskOutcomeLabel(status: BluebookSubmissionStatus | string): string {
  switch (status) {
    case "APPROVED":
      return "Complete";
    case "REJECTED":
      return "Incomplete";
    case "SUBMITTED":
      return "Under review";
    case "DRAFT":
      return "Not submitted";
    case "EXPIRED":
      return "Expired";
    default:
      return taskStatusLabel(status);
  }
}

/** Aggregate Blue Book submission status for a council member in a cycle. */
export function reportStatusLabel(
  status: BluebookSubmissionStatus | string,
  hasAssignments: boolean
): string {
  if (!hasAssignments) return "No tasks assigned";
  switch (status) {
    case "DRAFT":
      return "Not Submitted";
    case "SUBMITTED":
      return "Under Review";
    case "APPROVED":
      return "Reviewed";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Submission Closed";
    default:
      return status;
  }
}

export function isCycleOpen(closesAt: Date, opensAt?: Date, now = new Date()) {
  if (isSubmissionWindowsBypassEnabled()) return true;
  if (opensAt && now < opensAt) return false;
  return now <= closesAt;
}

export const BLUEBOOK_ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Under Vercel body limits we use signed Supabase uploads for large files. */
export const MAX_BLUEBOOK_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_BLUEBOOK_UPLOAD_LABEL = "10 MB";

export function isAllowedBluebookFile(file: {
  type: string;
  name: string;
}) {
  return (
    BLUEBOOK_ALLOWED_MIME.includes(file.type as (typeof BLUEBOOK_ALLOWED_MIME)[number]) ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.name.toLowerCase().endsWith(".docx")
  );
}
