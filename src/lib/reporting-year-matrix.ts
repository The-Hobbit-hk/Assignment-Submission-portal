import type { ClubStatus, MonthlyReport } from "@/generated/prisma/client";
import {
  getReportingWindowDates,
  getSubmissionWindowForReportPeriod,
  isMonthlyReportingComplete,
} from "@/lib/reporting";
import { getRotaryYearLabel, rotaryYearMonths } from "@/lib/rotary-year";
import { istCalendarParts } from "@/lib/timezone";

export type MonthCellStatus = "COMPLETE" | "MISSED" | "PENDING" | "NA";

export type ReportingYearMonth = {
  month: number;
  year: number;
  key: string;
  shortLabel: string;
};

export type ReportingYearMonthCell = {
  month: number;
  year: number;
  status: MonthCellStatus;
};

export type ReportingYearClubRow = {
  club: {
    id: string;
    name: string;
    zone: string | null;
    status: ClubStatus;
    charterNumber: string | null;
  };
  firstAccessAt: string | null;
  firstReportMonth: { month: number; year: number } | null;
  months: ReportingYearMonthCell[];
  expected: number;
  completed: number;
  missed: number;
  pending: number;
  /** completed / (completed + missed); null when nothing due yet */
  citationPct: number | null;
};

export type ReportingYearMatrix = {
  startYear: number;
  label: string;
  months: ReportingYearMonth[];
  clubs: ReportingYearClubRow[];
  summary: {
    totalClubs: number;
    perfectClubs: number;
    clubsWithMisses: number;
    clubsNotStarted: number;
    avgCitationPct: number | null;
  };
};

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function periodIndex(month: number, year: number) {
  return year * 12 + month;
}

function isPeriodClosed(month: number, year: number, now: Date) {
  const window = getSubmissionWindowForReportPeriod(month, year);
  const { closesAt } = getReportingWindowDates(window.month, window.year);
  return now.getTime() > closesAt.getTime();
}

/** Earliest portal access among club logins, as IST calendar month. */
export function firstReportableMonthFromAccess(
  accessAt: Date | null | undefined
): { month: number; year: number } | null {
  if (!accessAt) return null;
  const { month, year } = istCalendarParts(accessAt);
  return { month, year };
}

export function buildReportingYearMonths(startYear: number): ReportingYearMonth[] {
  return rotaryYearMonths(startYear).map(({ month, year }) => ({
    month,
    year,
    key: `${month}-${year}`,
    shortLabel: MONTH_SHORT[month - 1] ?? String(month),
  }));
}

type ClubInput = {
  id: string;
  name: string;
  zone: string | null;
  status: ClubStatus;
  charterNumber: string | null;
  /** Earliest club-login createdAt (portal access). */
  firstAccessAt: Date | null;
};

/**
 * Build Jul–Jun matrix for ACTIVE clubs.
 * Months before each club's first portal access are NA (not counted for citation).
 * After the submission window closes: COMPLETE (tick) or MISSED (cross).
 * Before the window closes: COMPLETE if already submitted, else PENDING.
 */
export function buildReportingYearMatrix(
  clubs: ClubInput[],
  reports: Pick<MonthlyReport, "clubId" | "type" | "month" | "year" | "status">[],
  startYear: number,
  now = new Date()
): ReportingYearMatrix {
  const months = buildReportingYearMonths(startYear);
  const reportsByClub = new Map<string, typeof reports>();
  for (const report of reports) {
    if (!report.clubId) continue;
    const list = reportsByClub.get(report.clubId) ?? [];
    list.push(report);
    reportsByClub.set(report.clubId, list);
  }

  const rows: ReportingYearClubRow[] = clubs.map((club) => {
    const clubReports = reportsByClub.get(club.id) ?? [];
    const firstReportMonth = firstReportableMonthFromAccess(club.firstAccessAt);
    const firstIdx = firstReportMonth
      ? periodIndex(firstReportMonth.month, firstReportMonth.year)
      : null;

    let expected = 0;
    let completed = 0;
    let missed = 0;
    let pending = 0;

    const monthCells: ReportingYearMonthCell[] = months.map(({ month, year }) => {
      const beforeAccess =
        firstIdx === null || periodIndex(month, year) < firstIdx;

      if (beforeAccess) {
        return { month, year, status: "NA" as const };
      }

      const admin = clubReports.find((r) => r.month === month && r.year === year && r.type === "ADMIN");
      const events = clubReports.find((r) => r.month === month && r.year === year && r.type === "EVENTS");
      const done = isMonthlyReportingComplete(admin, events);
      const closed = isPeriodClosed(month, year, now);

      expected += 1;

      if (done) {
        completed += 1;
        return { month, year, status: "COMPLETE" as const };
      }
      if (closed) {
        missed += 1;
        return { month, year, status: "MISSED" as const };
      }
      pending += 1;
      return { month, year, status: "PENDING" as const };
    });

    const due = completed + missed;
    return {
      club: {
        id: club.id,
        name: club.name,
        zone: club.zone,
        status: club.status,
        charterNumber: club.charterNumber,
      },
      firstAccessAt: club.firstAccessAt?.toISOString() ?? null,
      firstReportMonth,
      months: monthCells,
      expected,
      completed,
      missed,
      pending,
      citationPct: due > 0 ? Math.round((completed / due) * 1000) / 10 : null,
    };
  });

  rows.sort((a, b) => {
    const zoneCmp = (a.club.zone ?? "").localeCompare(b.club.zone ?? "");
    if (zoneCmp !== 0) return zoneCmp;
    return a.club.name.localeCompare(b.club.name);
  });

  const withDue = rows.filter((r) => r.completed + r.missed > 0);
  const perfectClubs = withDue.filter((r) => r.missed === 0 && r.completed > 0).length;
  const clubsWithMisses = rows.filter((r) => r.missed > 0).length;
  const clubsNotStarted = rows.filter((r) => r.firstReportMonth === null).length;
  const avgCitationPct =
    withDue.length > 0
      ? Math.round(
          (withDue.reduce((sum, r) => sum + (r.citationPct ?? 0), 0) / withDue.length) * 10
        ) / 10
      : null;

  return {
    startYear,
    label: getRotaryYearLabel(startYear),
    months,
    clubs: rows,
    summary: {
      totalClubs: rows.length,
      perfectClubs,
      clubsWithMisses,
      clubsNotStarted,
      avgCitationPct,
    },
  };
}
