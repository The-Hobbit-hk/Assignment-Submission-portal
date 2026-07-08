import type { MonthlyReportType, Prisma } from "@/generated/prisma/client";

type ReportClient = typeof import("@/lib/prisma").prisma;

function clubRelation(
  clubId: string | null
): Pick<Prisma.MonthlyReportCreateInput, "club"> {
  return clubId ? { club: { connect: { id: clubId } } } : {};
}

export async function upsertMonthlyReport(
  prisma: ReportClient,
  type: MonthlyReportType,
  key: { month: number; year: number; clubId?: string | null },
  data: Prisma.MonthlyReportUpdateInput
) {
  const clubId = key.clubId ?? null;
  const existing = await prisma.monthlyReport.findFirst({
    where: { type, month: key.month, year: key.year, clubId },
  });

  const { club: _club, submittedBy, type: _type, ...rest } = data;

  if (existing) {
    return prisma.monthlyReport.update({
      where: { id: existing.id },
      data: {
        ...rest,
        ...(submittedBy ? { submittedBy } : {}),
        ...clubRelation(clubId),
      },
    });
  }

  return prisma.monthlyReport.create({
    data: {
      ...rest,
      type,
      month: key.month,
      year: key.year,
      ...(submittedBy ? { submittedBy } : {}),
      ...clubRelation(clubId),
    } as Prisma.MonthlyReportCreateInput,
  });
}
