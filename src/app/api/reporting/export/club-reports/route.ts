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
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireRole(["REPORTING_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));
  const zoneFilter = searchParams.get("zone")?.trim() || null;

  try {
    const clubWhere: Prisma.ClubWhereInput = { ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER };
    if (zoneFilter) clubWhere.zone = zoneFilter;

    const clubs = await prisma.club.findMany({
      where: clubWhere,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true },
    });

    const clubIds = clubs.map((c) => c.id);
    const reports = await prisma.monthlyReport.findMany({
      where: { month, year, clubId: { in: clubIds } },
    });

    const rows = buildClubReportingRows(clubs, reports);
    const summary = summarizeClubReporting(rows);

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
      row.adminStatus,
      row.eventsStatus,
      row.completed ? "Yes" : "No",
      row.admin?.submittedAt ?? "",
      row.events?.submittedAt ?? "",
      countByClub.get(row.club.id) ?? 0,
    ]);

    const adminHeaders = [
      "Club",
      "Zone",
      "New Members",
      "Resolution Passed",
      "Resolution Date of Passing",
      "District Dues Paid",
      "Dues Paid For (Members)",
      "Dues Amount Paid",
      "Host Club",
      "District Event Attendance",
      "Newsletter Event",
      "Status",
      "Submitted At",
    ];
    const adminRows = rows.map((row) => [
      row.club.name,
      row.club.zone ?? "",
      row.admin?.newMembers ?? "",
      row.admin?.resolutionPassed ?? "",
      row.admin?.resolutionPassDate ? row.admin.resolutionPassDate.slice(0, 10) : "",
      row.admin?.districtDuesPaid ?? "",
      row.admin?.districtDuesMembersCount ?? "",
      row.admin?.districtDuesAmount ?? "",
      row.admin?.hostClub ?? "",
      row.admin?.districtEventAttendance ?? "",
      row.admin?.newsletterEvent ?? "",
      row.admin?.status ?? "NOT SUBMITTED",
      row.admin?.submittedAt ?? "",
    ]);

    const eventsHeaders = ["Club", "Zone", "Events In Period", "Status", "Submitted At"];
    const eventsRows = rows.map((row) => [
      row.club.name,
      row.club.zone ?? "",
      countByClub.get(row.club.id) ?? 0,
      row.events?.status ?? "NOT SUBMITTED",
      row.events?.submittedAt ?? "",
    ]);

    const analyticsHeaders = ["Metric", "Value"];
    const analyticsRows = [
      ["Report period", `${month}/${year}`],
      ["Total clubs", summary.total],
      ["Fully complete", summary.completed],
      ["Incomplete", summary.incomplete],
      ["Admin submitted", summary.adminSubmitted],
      ["Events submitted", summary.eventsSubmitted],
    ];

    const buffer = await multiSheetExcel([
      { name: "Overview", headers: overviewHeaders, rows: overviewRows },
      { name: "Admin Reports", headers: adminHeaders, rows: adminRows },
      { name: "Events Reports", headers: eventsHeaders, rows: eventsRows },
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
