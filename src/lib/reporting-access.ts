import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  canSubmitClubReporting,
  canViewAllClubReports,
  DISTRICT_ROLES,
  isClubUser,
} from "@/lib/roles";
import { ensureReportingWindow } from "@/lib/reporting-window";

export async function resolveReportingClubId(
  session: Session,
  requestedClubId?: string | null
): Promise<string | null> {
  if (isClubUser(session.user.role)) {
    if (session.user.clubId) {
      return session.user.clubId;
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clubId: true },
    });
    return user?.clubId ?? null;
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
    const clubId = await resolveReportingClubId(session);
    if (!clubId) {
      return { ok: false as const, status: 403, error: "Club account is not linked to a club." };
    }
    const { allowed, message } = await ensureReportingWindow(month, year, {
      userEmail: session.user.email,
    });
    if (!allowed) {
      return { ok: false as const, status: 403, error: message ?? "Reporting window is closed." };
    }
  }

  return { ok: true as const };
}

export async function requireReportingClubId(
  session: Session,
  requestedClubId?: string | null
) {
  const clubId = await resolveReportingClubId(session, requestedClubId);
  if (!clubId) {
    return {
      ok: false as const,
      status: 400,
      error: isClubUser(session.user.role)
        ? "Club account is not linked to a club. Sign out and sign in again, or contact the district secretary."
        : "Select a club before submitting this report.",
    };
  }
  return { ok: true as const, clubId };
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
