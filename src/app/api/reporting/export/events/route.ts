import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError } from "@/lib/api-errors";
import {
  EVENT_SUBMISSION_EXPORT_HEADERS,
  eventSubmissionExportRow,
  noEventSubmissionExportRow,
} from "@/lib/reporting-export-rows";

export async function GET(request: Request) {
  const { error } = await requireRole(["REPORTING_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));
  const zone = searchParams.get("zone")?.trim() || null;

  try {
    const clubs = await prisma.club.findMany({
      where: {
        ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
        ...(zone ? { zone } : {}),
      },
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true },
    });
    const clubIds = clubs.map((club) => club.id);

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const [events, reports] = await Promise.all([
      prisma.event.findMany({
        where: {
          clubId: { in: clubIds },
          startDate: { gte: periodStart, lte: periodEnd },
        },
        include: { club: { select: { id: true, name: true, zone: true } } },
        orderBy: [{ startDate: "asc" }, { title: "asc" }],
      }),
      prisma.monthlyReport.findMany({
        where: { type: "EVENTS", month, year, clubId: { in: clubIds } },
      }),
    ]);

    const reportByClub = new Map(reports.map((report) => [report.clubId, report]));
    const clubsWithEvents = new Set(events.map((event) => event.clubId).filter(Boolean));

    const rows = [
      ...events.map((event) =>
        eventSubmissionExportRow(event, event.clubId ? reportByClub.get(event.clubId) : null)
      ),
      ...clubs
        .filter((club) => !clubsWithEvents.has(club.id))
        .map((club) => noEventSubmissionExportRow(club, reportByClub.get(club.id))),
    ];

    const buffer = await rowsToExcel("Event Reports", [...EVENT_SUBMISSION_EXPORT_HEADERS], rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="event-reports-${month}-${year}.xlsx"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
