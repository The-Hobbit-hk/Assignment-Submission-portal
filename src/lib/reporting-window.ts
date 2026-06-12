import { prisma } from "@/lib/prisma";
import { isSubmissionWindowsBypassEnabled } from "@/lib/submission-windows";
import {
  getActiveReportPeriod,
  getSubmissionWindowForReportPeriod,
  getSubmissionWindowLabel,
} from "@/lib/reporting";

export {
  getActiveReportPeriod,
  getReportPeriodForWindow,
  getSubmissionWindowForReportPeriod,
  getSubmissionWindowLabel,
} from "@/lib/reporting";

/** Submission window calendar dates: 1st through 10th of a month. */
export function getReportingWindowDates(windowMonth: number, windowYear: number) {
  const opensAt = new Date(windowYear, windowMonth - 1, 1, 0, 0, 0, 0);
  const closesAt = new Date(windowYear, windowMonth - 1, 10, 23, 59, 59, 999);
  return { opensAt, closesAt };
}

export async function ensureReportingPeriod(reportMonth: number, reportYear: number) {
  const { month: windowMonth, year: windowYear } = getSubmissionWindowForReportPeriod(
    reportMonth,
    reportYear
  );
  const { opensAt, closesAt } = getReportingWindowDates(windowMonth, windowYear);

  const existing = await prisma.reportingPeriod.findUnique({
    where: { month_year: { month: reportMonth, year: reportYear } },
  });

  if (existing) {
    const datesMatch =
      existing.opensAt.getTime() === opensAt.getTime() &&
      existing.closesAt.getTime() === closesAt.getTime();
    if (!datesMatch) {
      return prisma.reportingPeriod.update({
        where: { id: existing.id },
        data: { opensAt, closesAt },
      });
    }
    return existing;
  }

  return prisma.reportingPeriod.create({
    data: { month: reportMonth, year: reportYear, opensAt, closesAt, isActive: true },
  });
}

export async function getReportingPeriod(reportMonth: number, reportYear: number) {
  return ensureReportingPeriod(reportMonth, reportYear);
}

export async function isReportingWindowOpen(reportMonth?: number, reportYear?: number) {
  const now = new Date();
  const active = getActiveReportPeriod(now);
  const m = reportMonth ?? active.month;
  const y = reportYear ?? active.year;
  const period = await ensureReportingPeriod(m, y);
  const labels = getSubmissionWindowLabel(m, y);

  if (isSubmissionWindowsBypassEnabled()) {
    return {
      open: true,
      period,
      reportMonth: m,
      reportYear: y,
      message: null,
    };
  }

  if (!period.isActive) {
    return {
      open: false,
      period,
      reportMonth: m,
      reportYear: y,
      message: `Reporting is not open for ${labels.reportLabel}.`,
    };
  }

  const open = now >= period.opensAt && now <= period.closesAt;
  return {
    open,
    period,
    reportMonth: m,
    reportYear: y,
    message: open
      ? null
      : now < period.opensAt
        ? `Reporting for ${labels.reportLabel} opens on ${labels.openLabel} (1st of the month following the report period).`
        : `Reporting for ${labels.reportLabel} closed on ${labels.closeLabel}. Submissions are accepted only from the 1st to the 10th of the month after the report period.`,
  };
}

export async function ensureReportingWindow(reportMonth: number, reportYear: number) {
  const { open, message } = await isReportingWindowOpen(reportMonth, reportYear);
  return { allowed: open, message };
}
