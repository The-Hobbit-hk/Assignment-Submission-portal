import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import {
  DISTRICT_ZONE_META,
  OFFICIAL_DISTRICT_CLUB_FILTER,
  OFFICIAL_ROTARACT_MEMBER_FILTER,
} from "@/lib/district-clubs-data";
import {
  getReportSubmissionLabel,
  getReportingPeriodLabel,
  getSubmissionWindowForReportPeriod,
  getReportingWindowDates,
} from "@/lib/reporting";
import { formatIstDate, formatIstDateTime, formatIstTime } from "@/lib/timezone";
import {
  buildCommandAlerts,
  rankCitationStandings,
  summarizeDistrictDues,
  summarizeZones,
  type CitationClubInput,
  type CitationStandingRow,
  type ClubReportInput,
  type CommandAlert,
  type DistrictDuesCounts,
  type ZoneReportingSummary,
} from "@/lib/district-command-center-metrics";

const ZONES = DISTRICT_ZONE_META.map((zone) => zone.zone);

export type CommandCenterPayload = {
  generatedAtLabel: string;
  period: { month: number; year: number; label: string; windowLabel: string };
  kpis: {
    activeClubs: number | null;
    totalClubs: number | null;
    activeRotaractors: number | null;
    reportingCompleted: number | null;
    reportingEligible: number | null;
    reportingPercent: number | null;
  };
  zones: ZoneReportingSummary[] | null;
  districtDues: DistrictDuesCounts | null;
  upcomingEvents: Array<{
    id: string;
    title: string;
    startLabel: string;
    timeLabel: string;
    venue: string | null;
    status: string;
    bannerUrl: string | null;
  }> | null;
  citations: {
    rows: CitationStandingRow[];
    total: number;
    page: number;
    pageSize: number;
    periodLabel: string;
  } | null;
  alerts: CommandAlert[] | null;
  errors: {
    clubs: boolean;
    members: boolean;
    reporting: boolean;
    events: boolean;
    citations: boolean;
  };
};

async function loadSection<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: boolean }> {
  try {
    return { data: await fn(), error: false };
  } catch (err) {
    console.error("[command-center]", err);
    return { data: null, error: true };
  }
}

export async function getDistrictCommandCenter(input: {
  month: number;
  year: number;
  zone?: string;
  query?: string;
  sort?: "rank" | "points" | "completion" | "pending";
  page?: number;
  pageSize?: number;
}): Promise<CommandCenterPayload> {
  const submissionWindow = getSubmissionWindowForReportPeriod(input.month, input.year);
  const window = getReportingWindowDates(submissionWindow.month, submissionWindow.year);
  const periodLabel = getReportingPeriodLabel(input.month, input.year);
  const pageSize = Math.min(50, Math.max(10, input.pageSize ?? 15));
  const page = Math.max(1, input.page ?? 1);

  const [clubSection, memberSection, reportSection, eventSection, citationSection] = await Promise.all([
    loadSection(async () => {
      const grouped = await prisma.club.groupBy({
        by: ["status"],
        where: OFFICIAL_DISTRICT_CLUB_FILTER,
        _count: { _all: true },
      });
      const total = grouped.reduce((sum, row) => sum + row._count._all, 0);
      const active = grouped.find((row) => row.status === "ACTIVE")?._count._all ?? 0;
      return { total, active };
    }),
    loadSection(() =>
      prisma.member.count({
        where: { status: "ACTIVE", ...OFFICIAL_ROTARACT_MEMBER_FILTER },
      })
    ),
    loadSection(async () => {
      const clubs = await prisma.club.findMany({
        where: OFFICIAL_DISTRICT_CLUB_FILTER,
        select: { id: true, name: true, zone: true, status: true },
      });
      const reports = await prisma.monthlyReport.findMany({
        where: { month: input.month, year: input.year, clubId: { in: clubs.map((club) => club.id) } },
        select: {
          clubId: true,
          type: true,
          status: true,
          districtDuesPaid: true,
          districtDuesAmount: true,
        },
      });
      const rows: Array<ClubReportInput & { declaredAmount: number | null }> = clubs.map((club) => {
        const admin = reports.find((report) => report.clubId === club.id && report.type === "ADMIN");
        const events = reports.find((report) => report.clubId === club.id && report.type === "EVENTS");
        const dues = admin?.districtDuesPaid === "yes" || admin?.districtDuesPaid === "no" ? admin.districtDuesPaid : null;
        return {
          clubId: club.id,
          clubName: club.name,
          zone: club.zone,
          active: club.status === "ACTIVE",
          admin: getReportSubmissionLabel(admin),
          events: getReportSubmissionLabel(events),
          districtDuesPaid: dues,
          declaredAmount: dues === "yes" ? admin?.districtDuesAmount ?? null : null,
        };
      });
      return { rows, zones: summarizeZones(rows, ZONES), dues: summarizeDistrictDues(rows) };
    }),
    loadSection(() =>
      prisma.event.findMany({
        where: {
          status: { in: ["UPCOMING", "ONGOING"] },
          startDate: { gte: new Date() },
          OR: [{ clubId: null }, { type: "DISTRICT" }],
        },
        orderBy: { startDate: "asc" },
        take: 5,
        select: { id: true, title: true, startDate: true, location: true, status: true, bannerUrl: true },
      })
    ),
    loadSection(async () => {
      const clubs = await prisma.club.findMany({
        where: OFFICIAL_DISTRICT_CLUB_FILTER,
        select: { id: true, name: true, zone: true, status: true },
      });
      const activeClubs = clubs.filter((club) => club.status === "ACTIVE");
      const assignments = await prisma.citationAssignment.findMany({
        where: {
          cadence: "YEARLY",
          rotaryYearLabel: siteConfig.rotaryYear,
          clubId: { in: activeClubs.map((club) => club.id) },
        },
        select: {
          clubId: true,
          status: true,
          awardedPoints: true,
          dueDate: true,
          definition: { select: { title: true, points: true } },
        },
      });
      const byClub = new Map<string, CitationClubInput["assignments"]>();
      for (const club of activeClubs) byClub.set(club.id, []);
      let pendingReviews = 0;
      let riOverdue = 0;
      let riDueSoon = 0;
      const now = Date.now();
      for (const row of assignments) {
        const bucket = byClub.get(row.clubId);
        if (!bucket) continue;
        bucket.push({
          status: row.status,
          awardedPoints: row.awardedPoints,
          definitionPoints: row.definition.points,
        });
        if (row.status === "SUBMITTED") pendingReviews += 1;
        const isRi = row.definition.title.toLowerCase().includes("ri dues");
        if (isRi && row.status !== "APPROVED" && row.dueDate) {
          const due = row.dueDate.getTime();
          if (due < now) riOverdue += 1;
          else if (due - now <= 3 * 24 * 60 * 60 * 1000) riDueSoon += 1;
        }
      }
      const ranked = rankCitationStandings(
        activeClubs.map((club) => ({
          clubId: club.id,
          clubName: club.name,
          zone: club.zone,
          assignments: byClub.get(club.id) ?? [],
        }))
      );
      return { ranked, pendingReviews, riOverdue, riDueSoon };
    }),
  ]);

  const reportRows = reportSection.data?.rows ?? [];
  const incomplete = reportRows
    .filter((row) => row.active && !(row.admin === "SUBMITTED" && row.events === "SUBMITTED"))
    .map((row) => ({ clubId: row.clubId, clubName: row.clubName, zone: row.zone }));
  const duesOpen = reportRows.filter((row) => row.active && row.districtDuesPaid !== "yes").length;
  const reportsHref = `/dashboard/reporting/club-reports?month=${input.month}&year=${input.year}`;

  const alerts =
    reportSection.error || citationSection.error
      ? null
      : buildCommandAlerts({
          now: new Date(),
          closesAt: window.closesAt,
          periodLabel,
          incompleteClubs: incomplete,
          pendingCitationReviews: citationSection.data?.pendingReviews ?? 0,
          districtDuesOpenClubs: duesOpen,
          riCitationOverdueClubs: citationSection.data?.riOverdue ?? 0,
          riCitationDueSoonClubs: citationSection.data?.riDueSoon ?? 0,
          clubReportsHref: reportsHref,
          citationReviewHref: "/dashboard/citations/review",
          districtDuesHref: `/dashboard/reporting/district-dues?month=${input.month}&year=${input.year}`,
        });

  const ranked = citationSection.data?.ranked ?? [];
  const query = input.query?.trim().toLowerCase() ?? "";
  const filtered = ranked.filter((row) => {
    if (input.zone && row.zone !== input.zone) return false;
    if (query && !row.clubName.toLowerCase().includes(query)) return false;
    return true;
  });
  const sort = input.sort ?? "rank";
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "points") return b.approvedPoints - a.approvedPoints || a.rank - b.rank;
    if (sort === "completion") return (b.completionPercent ?? -1) - (a.completionPercent ?? -1) || a.rank - b.rank;
    if (sort === "pending") return b.pendingCount - a.pendingCount || a.rank - b.rank;
    return a.rank - b.rank || a.clubName.localeCompare(b.clubName);
  });
  const start = (page - 1) * pageSize;

  const eligible = reportSection.data?.zones.reduce((sum, zone) => sum + zone.eligible, 0) ?? null;
  const completed = reportSection.data?.zones.reduce((sum, zone) => sum + zone.completed, 0) ?? null;

  return {
    generatedAtLabel: formatIstDateTime(new Date()),
    period: {
      month: input.month,
      year: input.year,
      label: periodLabel,
      windowLabel: `${formatIstDateTime(window.opensAt)} – ${formatIstDateTime(window.closesAt)}`,
    },
    kpis: {
      activeClubs: clubSection.data?.active ?? null,
      totalClubs: clubSection.data?.total ?? null,
      activeRotaractors: memberSection.data,
      reportingCompleted: reportSection.error ? null : completed,
      reportingEligible: reportSection.error ? null : eligible,
      reportingPercent:
        reportSection.error || eligible == null || completed == null || eligible <= 0
          ? null
          : Math.round((completed / eligible) * 100),
    },
    zones: reportSection.data?.zones ?? null,
    districtDues: reportSection.data?.dues ?? null,
    upcomingEvents:
      eventSection.data?.map((event) => ({
        id: event.id,
        title: event.title,
        startLabel: formatIstDate(event.startDate),
        timeLabel: formatIstTime(event.startDate),
        venue: event.location,
        status: event.status,
        bannerUrl: event.bannerUrl,
      })) ?? null,
    citations: citationSection.data
      ? {
          rows: sorted.slice(start, start + pageSize),
          total: sorted.length,
          page,
          pageSize,
          periodLabel: `RIY ${siteConfig.rotaryYear}`,
        }
      : null,
    alerts,
    errors: {
      clubs: clubSection.error,
      members: memberSection.error,
      reporting: reportSection.error,
      events: eventSection.error,
      citations: citationSection.error,
    },
  };
}
