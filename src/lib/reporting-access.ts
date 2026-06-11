import type { Session } from "next-auth";
import {
  canSubmitClubReporting,
  canViewAllClubReports,
  DISTRICT_ROLES,
  isClubUser,
} from "@/lib/roles";
import { ensureReportingWindow } from "@/lib/reporting-window";

export function resolveReportingClubId(
  session: Session,
  requestedClubId?: string | null
): string | null {
  if (isClubUser(session.user.role)) {
    return session.user.clubId ?? null;
  }
  if (DISTRICT_ROLES.includes(session.user.role) || canViewAllClubReports(session.user.role)) {
    return requestedClubId ?? null;
  }
  return null;
}

export async function assertClubReportingAccess(
  session: Session,
  month: number,
  year: number
) {
  if (!canSubmitClubReporting(session.user.role)) {
    return { ok: false as const, status: 403, error: "You cannot submit club reports." };
  }

  if (isClubUser(session.user.role)) {
    if (!session.user.clubId) {
      return { ok: false as const, status: 403, error: "Club account is not linked to a club." };
    }
    const { allowed, message } = await ensureReportingWindow(month, year);
    if (!allowed) {
      return { ok: false as const, status: 403, error: message ?? "Reporting window is closed." };
    }
  }

  return { ok: true as const };
}

/** Clubs can add events anytime; monthly report submission stays window-gated. */
export function assertClubEventCreateAccess(session: Session) {
  if (!canSubmitClubReporting(session.user.role)) {
    return { ok: false as const, status: 403, error: "You cannot add club events." };
  }

  if (isClubUser(session.user.role) && !session.user.clubId) {
    return {
      ok: false as const,
      status: 403,
      error: "Club account is not linked to a club.",
    };
  }

  return { ok: true as const };
}
