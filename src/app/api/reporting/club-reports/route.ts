import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  buildClubReportingRows,
  summarizeClubReporting,
} from "@/lib/reporting-club-status";
import { canViewAllClubReports, canViewZoneClubReports } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { getZonesForZonalRep } from "@/lib/zonal-reps";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError, forbidden } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const email = session!.user.email ?? "";
  const role = session!.user.role;
  const districtView = canViewAllClubReports(role);
  const zoneView = canViewZoneClubReports(email);

  if (!districtView && !zoneView) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));
  const zoneFilter = searchParams.get("zone")?.trim() || null;

  const assignedZones = getZonesForZonalRep(email);

  try {
    const clubWhere: Prisma.ClubWhereInput = { ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER };

    if (districtView) {
      if (zoneFilter) {
        clubWhere.zone = zoneFilter;
      }
    } else {
      clubWhere.zone = { in: assignedZones };
    }

    const clubs = await prisma.club.findMany({
      where: clubWhere,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true },
    });

    const clubIds = clubs.map((c) => c.id);
    const reports = await prisma.monthlyReport.findMany({
      where: {
        month,
        year,
        clubId: { in: clubIds },
      },
    });

    const rows = buildClubReportingRows(clubs, reports);
    const summary = summarizeClubReporting(rows);

    return NextResponse.json({
      month,
      year,
      scope: districtView ? "district" : "zone",
      zones: districtView ? null : assignedZones,
      zoneFilter: districtView ? zoneFilter : null,
      summary,
      clubs: rows,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load club reports.");
  }
}
