import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { buildEventWhere, serializeEvent } from "@/lib/event";
import { getActiveReportPeriod, serializeMonthlyReport } from "@/lib/reporting";
import { resolveReportingClubId } from "@/lib/reporting-access";
import { syncEventsReportIfClubHasEvents } from "@/lib/events-reporting-sync";
import { handleRouteError } from "@/lib/api-errors";

const eventInclude = {
  club: { select: { id: true, name: true } },
  _count: { select: { registrations: true } },
};

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));
  const clubId = await resolveReportingClubId(session!, searchParams.get("clubId"));

  try {
    const [initialReport, club, clubEvents, districtEvents] = await Promise.all([
      prisma.monthlyReport.findFirst({
        where: { type: "EVENTS", month, year, clubId },
      }),
      clubId
        ? prisma.club.findUnique({ where: { id: clubId }, select: { name: true } })
        : Promise.resolve(null),
      clubId
        ? prisma.event.findMany({
            where: buildEventWhere({ clubId, month, year }),
            orderBy: { startDate: "asc" },
            include: eventInclude,
          })
        : Promise.resolve([]),
      prisma.event.findMany({
        where: buildEventWhere({ districtOnly: true, month, year }),
        orderBy: { startDate: "asc" },
        include: eventInclude,
      }),
    ]);

    const report =
      clubId && clubEvents.length > 0 && initialReport?.status !== "SUBMITTED"
        ? await syncEventsReportIfClubHasEvents(prisma, {
            clubId,
            month,
            year,
            submittedByUserId: session!.user.id,
          })
        : initialReport;

    return NextResponse.json({
      report: report ? serializeMonthlyReport(report) : null,
      clubEvents: clubEvents.map(serializeEvent),
      districtEvents: districtEvents.map(serializeEvent),
      clubId,
      clubName: club?.name ?? null,
    }, {
      headers: {
        // Must not be browser-cached — Undo / submit toggles need fresh data.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load event reporting.");
  }
}
