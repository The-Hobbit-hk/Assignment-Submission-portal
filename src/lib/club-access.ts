import type { UserRole } from "@/types/auth";
import { canManageEvents, isClubUser } from "@/lib/roles";

type SessionClubUser = {
  role: UserRole;
  clubId?: string | null;
};

export function getClubUserClubId(session: SessionClubUser): string | null {
  return isClubUser(session.role) && session.clubId ? session.clubId : null;
}

export function canAccessClubRecord(
  session: SessionClubUser,
  clubId: string,
  districtRoles: UserRole[] = ["SUPER_ADMIN", "DISTRICT_ADMIN"]
): boolean {
  if (districtRoles.includes(session.role) || session.role === "REPORTING_SECRETARY") {
    return true;
  }
  const ownClubId = getClubUserClubId(session);
  return ownClubId === clubId;
}

/** District event managers, or club users editing their own club's event. */
export function canManageEventRecord(
  session: SessionClubUser,
  eventClubId: string | null | undefined
): boolean {
  if (canManageEvents(session.role)) return true;
  if (!eventClubId) return false;
  return getClubUserClubId(session) === eventClubId;
}

export function canAccessMemberRecord(
  session: SessionClubUser,
  memberClubId: string,
  districtRoles: UserRole[] = ["SUPER_ADMIN", "DISTRICT_ADMIN"]
): boolean {
  return canAccessClubRecord(session, memberClubId, districtRoles);
}
