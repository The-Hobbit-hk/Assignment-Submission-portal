import { Badge } from "@/components/ui/badge";
import type { ClubStatus } from "@/generated/prisma/client";

const variants: Record<ClubStatus, "success" | "secondary" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  PROVISIONAL: "warning",
};

export function ClubStatusBadge({ status }: { status: ClubStatus }) {
  return (
    <Badge variant={variants[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
