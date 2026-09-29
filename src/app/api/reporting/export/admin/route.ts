import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { adminReportExportRow, ADMIN_REPORT_EXPORT_HEADERS } from "@/lib/reporting-export-rows";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireRole([
    "REPORTING_SECRETARY",
    "DISTRICT_SECRETARY",
    ...DISTRICT_ROLES,
  ]);
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
    });

    const reports = await prisma.monthlyReport.findMany({
      where: { type: "ADMIN", month, year },
    });

    const rows = clubs.map((club) =>
      adminReportExportRow(
        club,
        reports.find((rep) => rep.clubId === club.id)
      )
    );

    const buffer = await rowsToExcel("Admin Reports", [...ADMIN_REPORT_EXPORT_HEADERS], rows);
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
