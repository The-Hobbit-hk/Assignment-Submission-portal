import { prisma } from "@/lib/prisma";
import {
  isReportingAlwaysOpenUser,
  isSubmissionWindowsBypassEnabled,
} from "@/lib/submission-windows";
import {
  getActiveReportPeriod,
  getReportingWindowDates,
  getSubmissionWindowForReportPeriod,
  getSubmissionWindowLabel,
} from "@/lib/reporting";
import { formatIstDateTime } from "@/lib/timezone";

export {
  getActiveReportPeriod,
  getReportPeriodForWindow,
  getReportingWindowDates,
  getSubmissionWindowForReportPeriod,
  getSubmissionWindowLabel,
} from "@/lib/reporting";

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

export async function isReportingWindowOpen(
  reportMonth?: number,
  reportYear?: number,
  opts?: { userEmail?: string | null }
) {
  const now = new Date();
  const active = getActiveReportPeriod(now);
  const m = reportMonth ?? active.month;
  const y = reportYear ?? active.year;
  const period = await ensureReportingPeriod(m, y);
  const labels = getSubmissionWindowLabel(m, y);

  if (isSubmissionWindowsBypassEnabled() || isReportingAlwaysOpenUser(opts?.userEmail)) {
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
        ? `Reporting for ${labels.reportLabel} opens on ${formatIstDateTime(period.opensAt)} IST (1st of the month following the report period).`
        : `Reporting for ${labels.reportLabel} closed on ${formatIstDateTime(period.closesAt)} IST. Submissions are accepted only from the 1st (12:00 am) to the 10th (11:59 pm) IST of the month after the report period.`,
  };
}

export async function ensureReportingWindow(
  reportMonth: number,
  reportYear: number,
  opts?: { userEmail?: string | null }
) {
  const { open, message } = await isReportingWindowOpen(reportMonth, reportYear, opts);
  return { allowed: open, message };
}
