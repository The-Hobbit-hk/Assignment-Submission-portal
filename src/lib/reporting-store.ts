import type { MonthlyReportType, Prisma } from "@/generated/prisma/client";

type ReportClient = typeof import("@/lib/prisma").prisma;

export async function upsertMonthlyReport(
  prisma: ReportClient,
  type: MonthlyReportType,
  key: { month: number; year: number; clubId?: string | null },
  data: Prisma.MonthlyReportUpdateInput
) {
  const clubId = key.clubId || null;
  const existing = await prisma.monthlyReport.findFirst({
    where: { type, month: key.month, year: key.year, clubId },
  });

  if (existing) {
    return prisma.monthlyReport.update({
      where: { id: existing.id },
      data,
    });
  }

  const { submittedBy, club, ...rest } = data;

  return prisma.monthlyReport.create({
    data: {
      type,
      month: key.month,
      year: key.year,
      clubId,
      ...rest,
      ...(submittedBy ? { submittedBy } : {}),
      ...(club ? { club } : {}),
    } as Prisma.MonthlyReportCreateInput,
  });
}
