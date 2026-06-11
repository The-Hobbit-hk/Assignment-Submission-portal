import { Badge } from "@/components/ui/badge";
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

export function BluebookStatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status as BluebookSubmissionStatus] ?? "secondary";
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
}
