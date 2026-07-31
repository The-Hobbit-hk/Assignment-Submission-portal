import { Badge } from "@/components/ui/badge";
import { memberTaskOutcomeLabel, taskStatusLabel } from "@/lib/bluebook-labels";
import type { BluebookSubmissionStatus } from "@/generated/prisma/client";

const VARIANTS: Record<
  BluebookSubmissionStatus,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  APPROVED: "success",
  SUBMITTED: "default",
  DRAFT: "secondary",
  REJECTED: "destructive",
  EXPIRED: "destructive",
};

export function BluebookStatusBadge({
  status,
  outcome = false,
}: {
  status: string;
  /** Show Complete / Incomplete wording used on My Bluebook after review. */
  outcome?: boolean;
}) {
  const variant = VARIANTS[status as BluebookSubmissionStatus] ?? "secondary";
  return (
    <Badge variant={variant}>
      {outcome ? memberTaskOutcomeLabel(status) : taskStatusLabel(status)}
    </Badge>
  );
}
