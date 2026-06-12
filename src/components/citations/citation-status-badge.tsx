import { Badge } from "@/components/ui/badge";
import { citationStatusLabel } from "@/lib/citations-shared";
import type { CitationAssignmentStatus } from "@/generated/prisma/client";

const VARIANTS: Record<
  CitationAssignmentStatus,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  APPROVED: "success",
  SUBMITTED: "default",
  DRAFT: "secondary",
  ASSIGNED: "secondary",
  REJECTED: "destructive",
  EXPIRED: "destructive",
};

export function CitationStatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status as CitationAssignmentStatus] ?? "secondary";
  return <Badge variant={variant}>{citationStatusLabel(status)}</Badge>;
}
