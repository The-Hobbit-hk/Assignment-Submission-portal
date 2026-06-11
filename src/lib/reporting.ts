import type { MonthlyReport } from "@/generated/prisma/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getReportingPeriodLabel(month: number, year: number) {
  return `${MONTHS[month - 1]?.toUpperCase() ?? "MONTH"} ${year}`;
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
    districtDuesPaid: r.districtDuesPaid,
    districtDuesFileUrl: r.districtDuesFileUrl,
    bylawsFileUrl: r.bylawsFileUrl,
    bylawsPassDate: r.bylawsPassDate?.toISOString() ?? null,
    hostClub: r.hostClub,
    districtEventAttendance: r.districtEventAttendance,
    newsletterEvent: r.newsletterEvent,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
  };
}
