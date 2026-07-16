import type { MonthlyReport } from "@/generated/prisma/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getReportingPeriodLabel(month: number, year: number) {
  return `${MONTHS[month - 1]?.toUpperCase() ?? "MONTH"} ${year}`;
}

/** Report period filed during the following month's submission window. */
export function getReportPeriodForWindow(windowMonth: number, windowYear: number) {
  let reportMonth = windowMonth - 1;
  let reportYear = windowYear;
  if (reportMonth < 1) {
    reportMonth = 12;
    reportYear -= 1;
  }
  return { month: reportMonth, year: reportYear };
}

export function getSubmissionWindowForReportPeriod(reportMonth: number, reportYear: number) {
  let windowMonth = reportMonth + 1;
  let windowYear = reportYear;
  if (windowMonth > 12) {
    windowMonth = 1;
    windowYear += 1;
  }
  return { month: windowMonth, year: windowYear };
}

/** Active report period (e.g. July 1–10 → June). */
export function getActiveReportPeriod(now = new Date()) {
  const windowMonth = now.getMonth() + 1;
  const windowYear = now.getFullYear();
  return getReportPeriodForWindow(windowMonth, windowYear);
}

export function getSubmissionWindowLabel(reportMonth: number, reportYear: number) {
  const { month, year } = getSubmissionWindowForReportPeriod(reportMonth, reportYear);
  const opensAt = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const closesAt = new Date(year, month - 1, 10, 23, 59, 59, 999);
  return {
    reportLabel: getReportingPeriodLabel(reportMonth, reportYear),
    windowMonth: month,
    windowYear: year,
    opensAt,
    closesAt,
    openLabel: opensAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    closeLabel: closesAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

export type SerializedMonthlyReport = ReturnType<typeof serializeMonthlyReport>;

export type ReportSubmissionLabel = "SUBMITTED" | "DRAFT" | "NOT SUBMITTED";

export function getReportSubmissionLabel(
  report: { status: string } | null | undefined
): ReportSubmissionLabel {
  if (!report) return "NOT SUBMITTED";
  if (report.status === "SUBMITTED") return "SUBMITTED";
  if (report.status === "DRAFT") return "DRAFT";
  return "NOT SUBMITTED";
}

/** Monthly reporting is complete only when both admin and events reports are submitted. */
export function isMonthlyReportingComplete(
  admin: { status: string } | null | undefined,
  events: { status: string } | null | undefined
) {
  return getReportSubmissionLabel(admin) === "SUBMITTED" && getReportSubmissionLabel(events) === "SUBMITTED";
}

export function serializeMonthlyReport(r: MonthlyReport) {
  return {
    id: r.id,
    type: r.type,
    month: r.month,
    year: r.year,
    clubId: r.clubId,
    status: r.status,
    newMembers: r.newMembers,
    resolutionPassed: r.resolutionPassed,
    resolutionFileUrl: r.resolutionFileUrl,
    resolutionPassDate: r.resolutionPassDate?.toISOString() ?? null,
    districtDuesPaid: r.districtDuesPaid,
    districtDuesFileUrl: r.districtDuesFileUrl,
    districtDuesMembersCount: r.districtDuesMembersCount,
    districtDuesAmount: r.districtDuesAmount,
    bylawsPassed: r.bylawsPassed,
    bylawsFileUrl: r.bylawsFileUrl,
    bylawsPassDate: r.bylawsPassDate?.toISOString() ?? null,
    hostClub: r.hostClub,
    districtEventAttendance: r.districtEventAttendance,
    newsletterEvent: r.newsletterEvent,
    noEventsDeclared: r.noEventsDeclared,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
  };
}
