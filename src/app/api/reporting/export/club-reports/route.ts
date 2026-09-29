import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { multiSheetExcel } from "@/lib/export";
import {
  buildClubReportingRows,
  summarizeClubReporting,
} from "@/lib/reporting-club-status";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { handleRouteError } from "@/lib/api-errors";
import {
  ADMIN_REPORT_EXPORT_HEADERS,
  EVENT_SUBMISSION_EXPORT_HEADERS,
  adminReportExportRow,
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
  const zoneFilter = searchParams.get("zone")?.trim() || null;

  try {
    const clubWhere: Prisma.ClubWhereInput = { ...OFFICIAL_DISTRICT_CLUB_FILTER };
    if (zoneFilter) clubWhere.zone = zoneFilter;

    const clubs = await prisma.club.findMany({
      where: clubWhere,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true, status: true },
    });

    const clubIds = clubs.map((c) => c.id);
    const reports = await prisma.monthlyReport.findMany({
      where: { month, year, clubId: { in: clubIds } },
    });

    const rows = buildClubReportingRows(clubs, reports);
    const summary = summarizeClubReporting(rows);
    const activeRows = rows.filter((r) => r.countsTowardReporting);

    const eventCounts = await prisma.event.groupBy({
      by: ["clubId"],
      where: {
        clubId: { in: clubIds },
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        },
      },
      _count: { id: true },
    });
    const countByClub = new Map(eventCounts.map((e) => [e.clubId!, e._count.id]));

    const overviewHeaders = [
      "Club",
      "Zone",
      "Club Status",
      "Admin Status",
      "Events Status",
      "Monthly Complete",
      "Admin Submitted At",
      "Events Submitted At",
      "Events In Period",
    ];
    const overviewRows = rows.map((row) => [
      row.club.name,
      row.club.zone ?? "",
      row.countsTowardReporting ? "ACTIVE" : row.club.status,
      row.countsTowardReporting ? row.adminStatus : "N/A",
      row.countsTowardReporting ? row.eventsStatus : "N/A",
      row.countsTowardReporting ? (row.completed ? "Yes" : "No") : "N/A — inactive",
      row.admin?.submittedAt ?? "",
      row.events?.submittedAt ?? "",
      countByClub.get(row.club.id) ?? 0,
    ]);

    const adminReports = reports.filter((report) => report.type === "ADMIN");
    const eventsReports = reports.filter((report) => report.type === "EVENTS");
    const adminByClub = new Map(adminReports.map((report) => [report.clubId, report]));
    const eventsByClub = new Map(eventsReports.map((report) => [report.clubId, report]));

    const adminRows = clubs.map((club) =>
      adminReportExportRow(club, adminByClub.get(club.id))
    );

    const periodEvents = await prisma.event.findMany({
      where: {
        clubId: { in: clubIds },
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        },
      },
      include: { club: { select: { id: true, name: true, zone: true } } },
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
    });
    const clubsWithEvents = new Set(
      periodEvents.map((event) => event.clubId).filter((id): id is string => Boolean(id))
    );
    const eventRows = [
      ...periodEvents.map((event) =>
        eventSubmissionExportRow(event, event.clubId ? eventsByClub.get(event.clubId) : null)
      ),
      ...clubs
        .filter((club) => !clubsWithEvents.has(club.id))
        .map((club) => noEventSubmissionExportRow(club, eventsByClub.get(club.id))),
    ];

    const analyticsHeaders = ["Metric", "Value"];
    const analyticsRows = [
      ["Report period", `${month}/${year}`],
      ["Total active clubs", summary.total],
      ["Fully complete", summary.completed],
      ["Incomplete", summary.incomplete],
      ["Admin submitted", summary.adminSubmitted],
      ["Events submitted", summary.eventsSubmitted],
      ["Inactive clubs (excluded from counts)", summary.inactive],
    ];

    const buffer = await multiSheetExcel([
      { name: "Overview", headers: overviewHeaders, rows: overviewRows },
      { name: "Admin Reports", headers: [...ADMIN_REPORT_EXPORT_HEADERS], rows: adminRows },
      { name: "Events Reports", headers: [...EVENT_SUBMISSION_EXPORT_HEADERS], rows: eventRows },
      { name: "Summary", headers: analyticsHeaders, rows: analyticsRows },
    ]);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="club-monthly-reports-${month}-${year}.xlsx"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
