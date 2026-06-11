import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  buildClubReportingRows,
  summarizeClubReporting,
} from "@/lib/reporting-club-status";
import { canViewAllClubReports, canViewZoneClubReports } from "@/lib/roles";
import { getZonesForZonalRep } from "@/lib/zonal-reps";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const email = session!.user.email ?? "";
  const role = session!.user.role;
  const districtView = canViewAllClubReports(role);
  const zoneView = canViewZoneClubReports(email);

  if (!districtView && !zoneView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const zoneFilter = searchParams.get("zone")?.trim() || null;

  const assignedZones = getZonesForZonalRep(email);

  try {
    const clubWhere: {
      status: "ACTIVE";
      zone?: string | { in: string[] };
    } = { status: "ACTIVE" };

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
  } catch {
    return NextResponse.json({ error: "Failed to load club reports." }, { status: 500 });
  }
}
