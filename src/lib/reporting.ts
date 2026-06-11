import type { MonthlyReport } from "@/generated/prisma/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getReportingPeriodLabel(month: number, year: number) {
  return `${MONTHS[month - 1]?.toUpperCase() ?? "MONTH"} ${year}`;
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
