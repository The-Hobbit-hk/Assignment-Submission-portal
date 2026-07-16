import { buildEventWhere } from "@/lib/event";
import { upsertMonthlyReport } from "@/lib/reporting-store";

type ReportClient = typeof import("@/lib/prisma").prisma;

export async function submitEventsReportForClub(
  prisma: ReportClient,
  params: {
    clubId: string;
    month: number;
    year: number;
    submittedByUserId: string;
  }
) {
  const existing = await prisma.monthlyReport.findFirst({
    where: {
      type: "EVENTS",
      month: params.month,
      year: params.year,
      clubId: params.clubId,
    },
  });

  if (existing?.status === "SUBMITTED") {
    // Club now has real events — clear any stale "no events" declaration.
    if (existing.noEventsDeclared) {
      return prisma.monthlyReport.update({
        where: { id: existing.id },
        data: { noEventsDeclared: false },
      });
    }
    return existing;
  }

  return upsertMonthlyReport(
    prisma,
    "EVENTS",
    { month: params.month, year: params.year, clubId: params.clubId },
    {
      submittedBy: { connect: { id: params.submittedByUserId } },
      status: "SUBMITTED",
      submittedAt: new Date(),
      noEventsDeclared: false,
    }
  );
}

/** Mark events reporting complete when the club has at least one event in the period. */
export async function syncEventsReportIfClubHasEvents(
  prisma: ReportClient,
  params: {
    clubId: string;
    month: number;
    year: number;
    submittedByUserId: string;
  }
) {
  const eventCount = await prisma.event.count({
    where: buildEventWhere({
      clubId: params.clubId,
      month: params.month,
      year: params.year,
    }),
  });

  if (eventCount === 0) {
    return null;
  }

  return submitEventsReportForClub(prisma, params);
}
