import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canViewAdminReportSubmissions } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { getReportSubmissionLabel } from "@/lib/reporting";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError, forbidden } from "@/lib/api-errors";

export type AdminSubmissionRow = {
  club: { id: string; name: string; zone: string | null };
  status: "SUBMITTED" | "DRAFT" | "NOT SUBMITTED";
  submittedAt: string | null;
  newMembers: number | null;
  resolutionPassed: string | null;
  resolutionFileUrl: string | null;
  resolutionPassDate: string | null;
  districtDuesPaid: string | null;
  districtDuesFileUrl: string | null;
  districtDuesMembersCount: number | null;
  districtDuesAmount: number | null;
  bylawsPassed: string | null;
  bylawsFileUrl: string | null;
  bylawsPassDate: string | null;
  masterBudgetPassed: string | null;
  masterBudgetFileUrl: string | null;
  masterBudgetPassDate: string | null;
  hostClub: string | null;
  districtEventAttendance: string | null;
};

function isoDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canViewAdminReportSubmissions(session!.user.role)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month), 10);
  const year = parseInt(searchParams.get("year") ?? String(active.year), 10);
  const zoneFilter = searchParams.get("zone")?.trim() || null;

  try {
    const clubWhere: Prisma.ClubWhereInput = {
      ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
    };
    if (zoneFilter) {
      clubWhere.zone = zoneFilter;
    }

    const clubs = await prisma.club.findMany({
      where: clubWhere,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true },
    });

    const clubIds = clubs.map((c) => c.id);
    const reports = await prisma.monthlyReport.findMany({
      where: { type: "ADMIN", month, year, clubId: { in: clubIds } },
    });

    const rows: AdminSubmissionRow[] = clubs.map((club) => {
      const r = reports.find((rep) => rep.clubId === club.id);
      return {
        club,
        status: getReportSubmissionLabel(r),
        submittedAt: r?.submittedAt?.toISOString() ?? null,
        newMembers: r?.newMembers ?? null,
        resolutionPassed: r?.resolutionPassed ?? null,
        resolutionFileUrl: r?.resolutionFileUrl ?? null,
        resolutionPassDate: isoDate(r?.resolutionPassDate),
        districtDuesPaid: r?.districtDuesPaid ?? null,
        districtDuesFileUrl: r?.districtDuesFileUrl ?? null,
        districtDuesMembersCount: r?.districtDuesMembersCount ?? null,
        districtDuesAmount: r?.districtDuesAmount ?? null,
        bylawsPassed: r?.bylawsPassed ?? null,
        bylawsFileUrl: r?.bylawsFileUrl ?? null,
        bylawsPassDate: isoDate(r?.bylawsPassDate),
        masterBudgetPassed: r?.masterBudgetPassed ?? null,
        masterBudgetFileUrl: r?.masterBudgetFileUrl ?? null,
        masterBudgetPassDate: isoDate(r?.masterBudgetPassDate),
        hostClub: r?.hostClub ?? null,
        districtEventAttendance: r?.districtEventAttendance ?? null,
      };
    });

    const summary = {
      totalClubs: rows.length,
      submitted: rows.filter((row) => row.status === "SUBMITTED").length,
      draft: rows.filter((row) => row.status === "DRAFT").length,
      notSubmitted: rows.filter((row) => row.status === "NOT SUBMITTED").length,
      resolutionYes: rows.filter((row) => row.resolutionPassed === "yes").length,
      duesYes: rows.filter((row) => row.districtDuesPaid === "yes").length,
      bylawsYes: rows.filter((row) => row.bylawsPassed === "yes").length,
      budgetYes: rows.filter((row) => row.masterBudgetPassed === "yes").length,
    };

    return NextResponse.json({
      month,
      year,
      zoneFilter,
      summary,
      clubs: rows,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load admin submissions.");
  }
}
