import type { BluebookSubmissionStatus } from "@/generated/prisma/client";

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

export function isAllowedBluebookFile(file: File) {
  return (
    BLUEBOOK_ALLOWED_MIME.includes(file.type as (typeof BLUEBOOK_ALLOWED_MIME)[number]) ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}
