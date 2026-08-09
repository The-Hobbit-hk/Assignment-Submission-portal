import type { Club, ClubStatus, MonthlyReport } from "@/generated/prisma/client";
import {
  getReportSubmissionLabel,
  isMonthlyReportingComplete,
  serializeMonthlyReport,
} from "@/lib/reporting";

export type ClubReportingRow = {
  club: { id: string; name: string; zone: string | null; status: ClubStatus };
  admin: ReturnType<typeof serializeMonthlyReport> | null;
  events: ReturnType<typeof serializeMonthlyReport> | null;
  adminStatus: ReturnType<typeof getReportSubmissionLabel>;
  eventsStatus: ReturnType<typeof getReportSubmissionLabel>;
  completed: boolean;
  /** False for inactive/provisional clubs — excluded from completion stats. */
  countsTowardReporting: boolean;
};

export type ClubReportingSummary = {
  total: number;
  completed: number;
  adminSubmitted: number;
  eventsSubmitted: number;
  incomplete: number;
  inactive: number;
};

export function isReportingActiveClub(
  status: ClubStatus | string | null | undefined
): boolean {
  return status === "ACTIVE";
}

export function buildClubReportingRows(
  clubs: Pick<Club, "id" | "name" | "zone" | "status">[],
  reports: MonthlyReport[]
): ClubReportingRow[] {
  return clubs.map((club) => {
    const admin = reports.find((r) => r.clubId === club.id && r.type === "ADMIN") ?? null;
    const events = reports.find((r) => r.clubId === club.id && r.type === "EVENTS") ?? null;
    const adminSerialized = admin ? serializeMonthlyReport(admin) : null;
    const eventsSerialized = events ? serializeMonthlyReport(events) : null;
    const countsTowardReporting = isReportingActiveClub(club.status);

    return {
      club: { id: club.id, name: club.name, zone: club.zone, status: club.status },
      admin: adminSerialized,
      events: eventsSerialized,
      adminStatus: getReportSubmissionLabel(adminSerialized),
      eventsStatus: getReportSubmissionLabel(eventsSerialized),
      completed: isMonthlyReportingComplete(adminSerialized, eventsSerialized),
      countsTowardReporting,
    };
  });
}

/** Summary metrics use active clubs only; inactive clubs are listed separately. */
export function summarizeClubReporting(rows: ClubReportingRow[]): ClubReportingSummary {
  const active = rows.filter((r) => r.countsTowardReporting);
  const completed = active.filter((r) => r.completed).length;
  const adminSubmitted = active.filter((r) => r.adminStatus === "SUBMITTED").length;
  const eventsSubmitted = active.filter((r) => r.eventsStatus === "SUBMITTED").length;

  return {
    total: active.length,
    completed,
    adminSubmitted,
    eventsSubmitted,
    incomplete: active.length - completed,
    inactive: rows.length - active.length,
  };
}
