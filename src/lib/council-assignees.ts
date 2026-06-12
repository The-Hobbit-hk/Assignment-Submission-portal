import type { PrismaClient } from "@/generated/prisma/client";
import { COUNCIL_USERS } from "@/lib/council-roster-data";

/** Official district council roster emails — all assignable for Blue Book tasks. */
export const COUNCIL_ROSTER_EMAILS = COUNCIL_USERS.map((u) =>
  u.email.toLowerCase().trim()
);

export function councilAssigneeUserWhere() {
  return { email: { in: COUNCIL_ROSTER_EMAILS } };
}

export async function fetchAssignableCouncilMembers(
  prisma: Pick<PrismaClient, "user">
) {
  return prisma.user.findMany({
    where: councilAssigneeUserWhere(),
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
