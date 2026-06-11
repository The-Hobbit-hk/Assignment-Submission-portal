import { Badge } from "@/components/ui/badge";
import type { MemberRole, MemberStatus } from "@/generated/prisma/client";

const statusVariants: Record<MemberStatus, "success" | "secondary" | "outline"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  ALUMNI: "outline",
};

const roleLabels: Record<MemberRole, string> = {
  PRESIDENT: "President",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  DIRECTOR: "Director",
  MEMBER: "Member",
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

export function MemberRoleBadge({ role }: { role: MemberRole }) {
  return <Badge variant="outline">{roleLabels[role]}</Badge>;
}
