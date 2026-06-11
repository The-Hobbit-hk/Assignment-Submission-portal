import type { Club, MonthlyReport } from "@/generated/prisma/client";
import {
  getReportSubmissionLabel,
  isMonthlyReportingComplete,
  serializeMonthlyReport,
} from "@/lib/reporting";

export type ClubReportingRow = {
  club: { id: string; name: string; zone: string | null };
  admin: ReturnType<typeof serializeMonthlyReport> | null;
  events: ReturnType<typeof serializeMonthlyReport> | null;
  adminStatus: ReturnType<typeof getReportSubmissionLabel>;
  eventsStatus: ReturnType<typeof getReportSubmissionLabel>;
  completed: boolean;
};

export type ClubReportingSummary = {
  total: number;
  completed: number;
  adminSubmitted: number;
  eventsSubmitted: number;
  incomplete: number;
};

export function buildClubReportingRows(
  clubs: Pick<Club, "id" | "name" | "zone">[],
  reports: MonthlyReport[]
): ClubReportingRow[] {
  return clubs.map((club) => {
    const admin = reports.find((r) => r.clubId === club.id && r.type === "ADMIN") ?? null;
    const events = reports.find((r) => r.clubId === club.id && r.type === "EVENTS") ?? null;
    const adminSerialized = admin ? serializeMonthlyReport(admin) : null;
    const eventsSerialized = events ? serializeMonthlyReport(events) : null;

    return {
      club: { id: club.id, name: club.name, zone: club.zone },
      admin: adminSerialized,
      events: eventsSerialized,
      adminStatus: getReportSubmissionLabel(adminSerialized),
      eventsStatus: getReportSubmissionLabel(eventsSerialized),
      completed: isMonthlyReportingComplete(adminSerialized, eventsSerialized),
    };
  });
}

export function summarizeClubReporting(rows: ClubReportingRow[]): ClubReportingSummary {
  const completed = rows.filter((r) => r.completed).length;
  const adminSubmitted = rows.filter((r) => r.adminStatus === "SUBMITTED").length;
  const eventsSubmitted = rows.filter((r) => r.eventsStatus === "SUBMITTED").length;

  return {
    total: rows.length,
    completed,
    adminSubmitted,
    eventsSubmitted,
    incomplete: rows.length - completed,
  };
}
