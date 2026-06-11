import { prisma } from "@/lib/prisma";

/** STAR reporting window: 1st through 10th of each month */
export function getReportingWindowDates(month: number, year: number) {
  const opensAt = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const closesAt = new Date(year, month - 1, 10, 23, 59, 59, 999);
  return { opensAt, closesAt };
}

export async function ensureReportingPeriod(month: number, year: number) {
  const existing = await prisma.reportingPeriod.findUnique({
    where: { month_year: { month, year } },
  });
  if (existing) return existing;

  const { opensAt, closesAt } = getReportingWindowDates(month, year);
  return prisma.reportingPeriod.create({
    data: { month, year, opensAt, closesAt, isActive: true },
  });
}

export async function getReportingPeriod(month: number, year: number) {
  return ensureReportingPeriod(month, year);
}

export async function isReportingWindowOpen(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();
  const period = await ensureReportingPeriod(m, y);

  if (!period.isActive) {
    return {
      open: false,
      period,
      message: "Reporting window is not open for this month.",
    };
  }

  const open = now >= period.opensAt && now <= period.closesAt;
  return {
    open,
    period,
    message: open
      ? null
      : now < period.opensAt
        ? `Reporting opens on ${period.opensAt.toLocaleDateString()} (1st of the month).`
        : `Reporting closed on ${period.closesAt.toLocaleDateString()}. Submissions are accepted only from the 1st to the 10th.`,
  };
}

export async function ensureReportingWindow(month: number, year: number) {
  const { open, message } = await isReportingWindowOpen(month, year);
  return { allowed: open, message };
}
