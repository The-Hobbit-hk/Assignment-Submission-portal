import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canViewAllClubReports, canViewZoneClubReports } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { getZonesForZonalRep } from "@/lib/zonal-reps";
import { getCurrentRotaryYear, rotaryYearMonths } from "@/lib/rotary-year";
import { buildReportingYearMatrix } from "@/lib/reporting-year-matrix";
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
  const current = getCurrentRotaryYear();
  const startYearRaw = parseInt(searchParams.get("startYear") ?? String(current.startYear), 10);
  const startYear =
    Number.isFinite(startYearRaw) && startYearRaw >= 2020 && startYearRaw <= 2100
      ? startYearRaw
      : current.startYear;
  const zoneFilter = searchParams.get("zone")?.trim() || null;
  const assignedZones = getZonesForZonalRep(email);

  try {
    const clubWhere: Prisma.ClubWhereInput = {
      ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
    };

    if (districtView) {
      if (zoneFilter) clubWhere.zone = zoneFilter;
    } else {
      clubWhere.zone = { in: assignedZones };
    }

    const clubs = await prisma.club.findMany({
      where: clubWhere,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        zone: true,
        status: true,
        charterNumber: true,
        clubLogins: {
          where: { role: { in: ["CLUB_PRESIDENT", "CLUB_SECRETARY"] } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    const clubIds = clubs.map((c) => c.id);
    const yearMonths = rotaryYearMonths(startYear);
    const orFilters = yearMonths.map(({ month, year }) => ({ month, year }));

    const reports =
      clubIds.length === 0
        ? []
        : await prisma.monthlyReport.findMany({
            where: {
              clubId: { in: clubIds },
              OR: orFilters,
            },
            select: {
              clubId: true,
              type: true,
              month: true,
              year: true,
              status: true,
            },
          });

    const matrix = buildReportingYearMatrix(
      clubs.map((club) => ({
        id: club.id,
        name: club.name,
        zone: club.zone,
        status: club.status,
        charterNumber: club.charterNumber,
        firstAccessAt: club.clubLogins[0]?.createdAt ?? null,
      })),
      reports,
      startYear
    );

    return NextResponse.json({
      ...matrix,
      scope: districtView ? "district" : "zone",
      zones: districtView ? null : assignedZones,
      zoneFilter: districtView ? zoneFilter : null,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load reporting year status.");
  }
}
