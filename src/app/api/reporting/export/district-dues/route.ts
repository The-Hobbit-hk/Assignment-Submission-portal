import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { canViewDistrictDues } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError, forbidden } from "@/lib/api-errors";

const duesLabel = (v: string | null) =>
  v === "yes" ? "Paid" : v === "no" ? "Not paid" : "Pending";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canViewDistrictDues(session!.user.role, session!.user.email)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));

  try {
    const clubs = await prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: { id: true, name: true, zone: true },
    });

    const clubIds = clubs.map((c) => c.id);
    const reports = await prisma.monthlyReport.findMany({
      where: { type: "ADMIN", month, year, clubId: { in: clubIds } },
    });

    const headers = [
      "Club",
      "Zone",
      "District Dues",
      "Members Paid For",
      "Amount Paid",
      "Proof",
      "Status",
      "Submitted At",
    ];

    const rows = clubs.map((club) => {
      const r = reports.find((rep) => rep.clubId === club.id);
      return [
        club.name,
        club.zone ?? "",
        duesLabel(r?.districtDuesPaid ?? null),
        r?.districtDuesPaid === "yes" ? (r?.districtDuesMembersCount ?? "") : "",
        r?.districtDuesPaid === "yes" ? (r?.districtDuesAmount ?? "") : "",
        r?.districtDuesFileUrl ?? "",
        r?.status ?? "NOT SUBMITTED",
        r?.submittedAt?.toISOString() ?? "",
      ];
    });

    const buffer = await rowsToExcel("District Dues", headers, rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="district-dues-${month}-${year}.xlsx"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
