import type { MonthlyReport } from "@/generated/prisma/client";
import { getEventTypeLabel } from "@/lib/event-types";

export const ADMIN_REPORT_EXPORT_HEADERS = [
  "Club Name",
  "Zone",
  "New Members",
  "Resolution Passed",
  "Resolution Date of Passing",
  "Resolution File URL",
  "District Dues Paid",
  "Dues Paid For (Members)",
  "Dues Amount Paid",
  "District Dues File URL",
  "Bylaws Passed",
  "Bylaws Date of Passing",
  "Bylaws File URL",
  "Master Budget Passed",
  "Master Budget Date of Passing",
  "Master Budget File URL",
  "Host Club",
  "District Event Attendance",
  "Status",
  "Submitted At",
] as const;

export const EVENT_SUBMISSION_EXPORT_HEADERS = [
  "Club",
  "Zone",
  "Events Report Status",
  "No Events Declared",
  "Event Name",
  "Event Type",
  "Venue",
  "Hosted By",
  "Collaborations",
  "Attendance",
  "Description",
  "Event Start",
  "Event End",
  "For District Newsletter",
  "Minutes URL",
  "Image URL",
] as const;

function day(value: Date | string | null | undefined) {
  if (!value) return "";
  const iso = value instanceof Date ? value.toISOString() : value;
  return iso.slice(0, 10);
}

function stamp(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

export function adminReportExportRow(
  club: { name: string; zone?: string | null },
  report: MonthlyReport | null | undefined
): (string | number | null)[] {
  return [
    club.name,
    club.zone ?? "",
    report?.newMembers ?? "",
    report?.resolutionPassed ?? "",
    report?.resolutionPassDate ? day(report.resolutionPassDate) : "",
    report?.resolutionFileUrl ?? "",
    report?.districtDuesPaid ?? "",
    report?.districtDuesMembersCount ?? "",
    report?.districtDuesAmount ?? "",
    report?.districtDuesFileUrl ?? "",
    report?.bylawsPassed ?? "",
    report?.bylawsPassDate ? day(report.bylawsPassDate) : "",
    report?.bylawsFileUrl ?? "",
    report?.masterBudgetPassed ?? "",
    report?.masterBudgetPassDate ? day(report.masterBudgetPassDate) : "",
    report?.masterBudgetFileUrl ?? "",
    report?.hostClub ?? "",
    report?.districtEventAttendance ?? "",
    report?.status ?? "NOT SUBMITTED",
    report?.submittedAt ? stamp(report.submittedAt) : "",
  ];
}

type EventExportSource = {
  title: string;
  type: string;
  location: string | null;
  hostedBy: string | null;
  collaborations: string | null;
  attendees: number;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  forDistrictNewsletter: boolean;
  minutesPdfUrl: string | null;
  bannerUrl: string | null;
  club?: { name: string; zone?: string | null } | null;
};

export function eventSubmissionExportRow(
  event: EventExportSource,
  report?: { status: string; noEventsDeclared?: boolean } | null
): (string | number | null)[] {
  return [
    event.club?.name ?? "",
    event.club?.zone ?? "",
    report?.status ?? "",
    report?.noEventsDeclared ? "Yes" : "No",
    event.title,
    getEventTypeLabel(event.type),
    event.location ?? "",
    event.hostedBy ?? "",
    event.collaborations ?? "",
    event.attendees,
    event.description ?? "",
    event.startDate.toISOString(),
    event.endDate?.toISOString() ?? "",
    event.forDistrictNewsletter ? "Yes" : "No",
    event.minutesPdfUrl ?? "",
    event.bannerUrl ?? "",
  ];
}

export function noEventSubmissionExportRow(club: {
  name: string;
  zone?: string | null;
}, report?: { status: string; noEventsDeclared?: boolean } | null): (string | number | null)[] {
  return [
    club.name,
    club.zone ?? "",
    report?.status ?? "NOT SUBMITTED",
    report?.noEventsDeclared ? "Yes" : "No",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
}
