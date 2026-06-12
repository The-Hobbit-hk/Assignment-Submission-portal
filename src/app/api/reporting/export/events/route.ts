import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";

export async function GET(request: Request) {
  const { error } = await requireRole(["REPORTING_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));

  try {
    const clubs = await prisma.club.findMany({
      where: { ...OFFICIAL_DISTRICT_CLUB_FILTER, status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    const reports = await prisma.monthlyReport.findMany({
      where: { type: "EVENTS", month, year },
    });

    const headers = ["Club Name", "Events This Month", "Status", "Submitted At"];

    const eventCounts = await prisma.event.groupBy({
      by: ["clubId"],
      where: {
        clubId: { not: null },
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        },
      },
      _count: { id: true },
    });

    const countByClub = new Map(
      eventCounts.map((e) => [e.clubId!, e._count.id])
    );

    const rows = clubs.map((club) => {
      const r = reports.find((rep) => rep.clubId === club.id);
      return [
        club.name,
        countByClub.get(club.id) ?? 0,
        r?.status ?? "NOT SUBMITTED",
        r?.submittedAt?.toISOString() ?? "",
      ];
    });

    const buffer = await rowsToExcel("Event Reports", headers, rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="event-reports-${month}-${year}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
