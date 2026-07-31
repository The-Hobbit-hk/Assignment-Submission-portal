import { Badge } from "@/components/ui/badge";
import { citationStatusLabel } from "@/lib/citations-shared";
import type { CitationAssignmentStatus } from "@/generated/prisma/client";

const VARIANTS: Record<
  CitationAssignmentStatus,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  APPROVED: "success",
  SUBMITTED: "warning",
  DRAFT: "secondary",
  ASSIGNED: "secondary",
  REJECTED: "destructive",
  EXPIRED: "destructive",
};

export function CitationStatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status as CitationAssignmentStatus] ?? "secondary";
  return (
    <Badge
      variant={variant}
      className={
        variant === "warning"
          ? "bg-amber-100 text-amber-900 border-transparent"
          : variant === "success"
            ? "bg-emerald-100 text-emerald-900 border-transparent"
            : undefined
      }
    >
      {citationStatusLabel(status)}
    </Badge>
  );
}
