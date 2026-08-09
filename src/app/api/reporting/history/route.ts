import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { resolveReportingClubId } from "@/lib/reporting-access";
import {
  canSubmitClubReporting,
  canViewAllClubReports,
  isClubUser,
} from "@/lib/roles";
import {
  getReportSubmissionLabel,
  getReportingPeriodLabel,
  isMonthlyReportingComplete,
  serializeMonthlyReport,
} from "@/lib/reporting";
import {
  getCurrentRotaryYear,
  getRotaryYearLabel,
  rotaryYearMonths,
  rotaryYearOfMonth,
} from "@/lib/rotary-year";
import { handleRouteError, forbidden, apiError } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

/**
 * Club reporting history — past months' admin/events status for verification.
 * Clubs see their own club; district roles may pass ?clubId=.
 */
export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  const canView =
    isClubUser(role) || canSubmitClubReporting(role) || canViewAllClubReports(role);
  if (!canView) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const requestedClubId = searchParams.get("clubId");
  const clubId = await resolveReportingClubId(session!, requestedClubId);

  if (!clubId) {
    return apiError(
      isClubUser(role)
        ? "Club account is not linked to a club."
        : "Select a club to view reporting history.",
      400
    );
  }

  if (isClubUser(role) && session!.user.clubId && session!.user.clubId !== clubId) {
    return forbidden();
  }

  try {
    const now = new Date();
    const currentRy = getCurrentRotaryYear(now);
    const startYearParam = searchParams.get("rotaryYear");
    const startYear = startYearParam
      ? parseInt(startYearParam, 10)
      : currentRy.startYear;

    if (!startYear || startYear < 2020 || startYear > 2100) {
      return apiError("Invalid Rotary year.", 400);
    }

    const periods = rotaryYearMonths(startYear);
    const activeMonth = now.getMonth() + 1;
    const activeYear = now.getFullYear();
    const visiblePeriods = periods.filter((p) => {
      if (p.year < activeYear) return true;
      if (p.year > activeYear) return false;
      return p.month <= activeMonth;
    });

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true },
    });

    const reports =
      visiblePeriods.length === 0
        ? []
        : await prisma.monthlyReport.findMany({
            where: {
              clubId,
              OR: visiblePeriods.map((p) => ({ month: p.month, year: p.year })),
            },
          });

    const eventCounts = await Promise.all(
      visiblePeriods.map((p) =>
        prisma.event.count({
          where: {
            clubId,
            startDate: {
              gte: new Date(p.year, p.month - 1, 1),
              lte: new Date(p.year, p.month, 0, 23, 59, 59, 999),
            },
          },
        })
      )
    );

    const months = visiblePeriods
      .map((p, index) => {
        const admin =
          reports.find((r) => r.month === p.month && r.year === p.year && r.type === "ADMIN") ??
          null;
        const events =
          reports.find((r) => r.month === p.month && r.year === p.year && r.type === "EVENTS") ??
          null;
        const adminSerialized = admin ? serializeMonthlyReport(admin) : null;
        const eventsSerialized = events ? serializeMonthlyReport(events) : null;

        return {
          month: p.month,
          year: p.year,
          periodLabel: getReportingPeriodLabel(p.month, p.year),
          rotaryYearLabel: getRotaryYearLabel(rotaryYearOfMonth(p.month, p.year)),
          adminStatus: getReportSubmissionLabel(adminSerialized),
          eventsStatus: getReportSubmissionLabel(eventsSerialized),
          completed: isMonthlyReportingComplete(adminSerialized, eventsSerialized),
          eventCount: eventCounts[index] ?? 0,
          admin: adminSerialized,
          events: eventsSerialized,
        };
      })
      .reverse();

    return NextResponse.json({
      club,
      rotaryYearLabel: getRotaryYearLabel(startYear),
      rotaryYearStart: startYear,
      months,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load reporting history.");
  }
}
