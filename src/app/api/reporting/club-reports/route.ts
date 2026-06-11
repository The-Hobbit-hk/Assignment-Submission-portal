import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeMonthlyReport } from "@/lib/reporting";
import { DISTRICT_ROLES } from "@/lib/roles";

export async function GET(request: Request) {
  const { error } = await requireRole(["REPORTING_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  try {
    const clubs = await prisma.club.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    const reports = await prisma.monthlyReport.findMany({
      where: { month, year, clubId: { not: null } },
      include: { club: { select: { id: true, name: true } } },
    });

    const byClub = new Map(
      clubs.map((club) => {
        const admin = reports.find((r) => r.clubId === club.id && r.type === "ADMIN");
        const events = reports.find((r) => r.clubId === club.id && r.type === "EVENTS");
        return [
          club.id,
          {
            club: { id: club.id, name: club.name },
            admin: admin ? serializeMonthlyReport(admin) : null,
            events: events ? serializeMonthlyReport(events) : null,
          },
        ];
      })
    );

    return NextResponse.json({
      month,
      year,
      clubs: Array.from(byClub.values()),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load club reports." }, { status: 500 });
  }
}
