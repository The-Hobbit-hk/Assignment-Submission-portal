import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canViewDistrictDues } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { handleRouteError, forbidden } from "@/lib/api-errors";

export type DistrictDuesRow = {
  club: { id: string; name: string; zone: string | null };
  districtDuesPaid: string | null;
  membersCount: number | null;
  amount: number | null;
  fileUrl: string | null;
  status: string;
  submittedAt: string | null;
};

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

    const rows: DistrictDuesRow[] = clubs.map((club) => {
      const r = reports.find((rep) => rep.clubId === club.id);
      return {
        club,
        districtDuesPaid: r?.districtDuesPaid ?? null,
        membersCount: r?.districtDuesMembersCount ?? null,
        amount: r?.districtDuesAmount ?? null,
        fileUrl: r?.districtDuesFileUrl ?? null,
        status: r?.status ?? "NOT_SUBMITTED",
        submittedAt: r?.submittedAt?.toISOString() ?? null,
      };
    });

    const paidRows = rows.filter((row) => row.districtDuesPaid === "yes");
    const summary = {
      totalClubs: rows.length,
      clubsPaid: paidRows.length,
      clubsUnpaid: rows.filter((row) => row.districtDuesPaid === "no").length,
      clubsPending: rows.filter((row) => !row.districtDuesPaid).length,
      totalMembers: paidRows.reduce((sum, row) => sum + (row.membersCount ?? 0), 0),
      totalAmount: paidRows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
    };

    return NextResponse.json({ month, year, summary, clubs: rows });
  } catch (err) {
    return handleRouteError(err, "Failed to load district dues.");
  }
}
