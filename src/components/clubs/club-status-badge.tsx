import { Badge } from "@/components/ui/badge";
import type { ClubStatus } from "@/generated/prisma/client";

export function ClubStatusBadge({ status }: { status: ClubStatus }) {
  const label =
    status === "PROVISIONAL" || status === "ACTIVE"
      ? "Active"
      : status.charAt(0) + status.slice(1).toLowerCase();
  const variant = status === "INACTIVE" ? "secondary" : "success";

  return <Badge variant={variant}>{label}</Badge>;
}
