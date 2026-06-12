import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireRole(["REPORTING_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));

  try {
    const clubs = await prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      orderBy: { name: "asc" },
    });

    const reports = await prisma.monthlyReport.findMany({
      where: { type: "ADMIN", month, year },
    });

    const headers = [
      "Club Name",
      "New Members",
      "Resolution Passed",
      "District Dues Paid",
      "Host Club",
      "District Event Attendance",
      "Newsletter Event",
      "Status",
      "Submitted At",
    ];

    const rows = clubs.map((club) => {
      const r = reports.find((rep) => rep.clubId === club.id);
      return [
        club.name,
        r?.newMembers ?? "",
        r?.resolutionPassed ?? "",
        r?.districtDuesPaid ?? "",
        r?.hostClub ?? "",
        r?.districtEventAttendance ?? "",
        r?.newsletterEvent ?? "",
        r?.status ?? "NOT SUBMITTED",
        r?.submittedAt?.toISOString() ?? "",
      ];
    });

    const buffer = await rowsToExcel("Admin Reports", headers, rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="admin-reports-${month}-${year}.xlsx"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
