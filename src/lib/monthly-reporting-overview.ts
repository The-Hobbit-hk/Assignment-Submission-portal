import { prisma } from "@/lib/prisma";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER, DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import {
  buildClubReportingRows,
  summarizeClubReporting,
  type ClubReportingRow,
} from "@/lib/reporting-club-status";
import { getReportingPeriodLabel } from "@/lib/reporting";
import {
  CLUB_EVENT_AVENUE_VALUES,
  getEventTypeLabel,
} from "@/lib/event-types";

export type ZoneOverview = {
  zone: string;
  total: number;
  completed: number;
  incomplete: number;
  pct: number;
  newMembers: number;
  duesPaidClubs: number;
  duesMembers: number;
  eventCount: number;
  completedClubs: { name: string }[];
};

export type AvenueCount = {
  type: string;
  label: string;
  count: number;
};

export type MonthlyReportingOverview = {
  month: number;
  year: number;
  periodLabel: string;
  summary: {
    totalClubs: number;
    completedClubs: number;
    incompleteClubs: number;
    totalEvents: number;
    newMembers: number;
    duesPaidClubs: number;
    duesMembers: number;
  };
  zones: ZoneOverview[];
  avenues: AvenueCount[];
  perfectZones: string[];
};

function periodBounds(month: number, year: number) {
  return {
    gte: new Date(year, month - 1, 1),
    lte: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

export async function buildMonthlyReportingOverview(
  month: number,
  year: number
): Promise<MonthlyReportingOverview> {
  const clubs = await prisma.club.findMany({
    where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
    orderBy: [{ zone: "asc" }, { name: "asc" }],
    select: { id: true, name: true, zone: true, status: true },
  });

  const clubIds = clubs.map((c) => c.id);
  const reports = await prisma.monthlyReport.findMany({
    where: { month, year, clubId: { in: clubIds } },
  });

  const rows = buildClubReportingRows(clubs, reports);
  const districtSummary = summarizeClubReporting(rows);

  const startBounds = periodBounds(month, year);
  const [eventByClub, eventByType] = await Promise.all([
    prisma.event.groupBy({
      by: ["clubId"],
      where: { clubId: { in: clubIds }, startDate: startBounds },
      _count: { id: true },
    }),
    prisma.event.groupBy({
      by: ["type"],
      where: { clubId: { in: clubIds }, startDate: startBounds },
      _count: { id: true },
    }),
  ]);

  const eventsByClubId = new Map(
    eventByClub.map((e) => [e.clubId!, e._count.id])
  );
  const totalEvents = [...eventsByClubId.values()].reduce((a, b) => a + b, 0);

  const newMembers = rows.reduce(
    (sum, row) => sum + (row.admin?.newMembers ?? 0),
    0
  );
  const duesPaidRows = rows.filter((r) => r.admin?.districtDuesPaid === "yes");
  const duesPaidClubs = duesPaidRows.length;
  const duesMembers = duesPaidRows.reduce(
    (sum, row) => sum + (row.admin?.districtDuesMembersCount ?? 0),
    0
  );

  const zoneOrder = DISTRICT_ZONE_META.map((z) => z.zone);
  const zones: ZoneOverview[] = zoneOrder.map((zone) => {
    const zoneRows = rows.filter((r) => r.club.zone === zone);
    const completedRows = zoneRows.filter((r) => r.completed);
    const total = zoneRows.length;
    const completed = completedRows.length;
    const zoneNewMembers = zoneRows.reduce(
      (sum, row) => sum + (row.admin?.newMembers ?? 0),
      0
    );
    const zoneDuesPaid = zoneRows.filter(
      (r) => r.admin?.districtDuesPaid === "yes"
    );
    const zoneEvents = zoneRows.reduce(
      (sum, row) => sum + (eventsByClubId.get(row.club.id) ?? 0),
      0
    );

    return {
      zone,
      total,
      completed,
      incomplete: total - completed,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      newMembers: zoneNewMembers,
      duesPaidClubs: zoneDuesPaid.length,
      duesMembers: zoneDuesPaid.reduce(
        (sum, row) => sum + (row.admin?.districtDuesMembersCount ?? 0),
        0
      ),
      eventCount: zoneEvents,
      completedClubs: completedRows.map((r) => ({ name: r.club.name })),
    };
  });

  const avenueSet = new Set<string>(CLUB_EVENT_AVENUE_VALUES);
  const avenueMap = new Map<string, number>();
  for (const row of eventByType) {
    const key = avenueSet.has(row.type) ? row.type : "OTHER";
    avenueMap.set(key, (avenueMap.get(key) ?? 0) + row._count.id);
  }

  const avenues: AvenueCount[] = [
    ...CLUB_EVENT_AVENUE_VALUES.map((type) => ({
      type,
      label: getEventTypeLabel(type),
      count: avenueMap.get(type) ?? 0,
    })),
    ...(avenueMap.has("OTHER")
      ? [{ type: "OTHER", label: "Other", count: avenueMap.get("OTHER")! }]
      : []),
  ].filter((a) => a.count > 0);

  const perfectZones = zones
    .filter((z) => z.total > 0 && z.completed === z.total)
    .map((z) => z.zone);

  return {
    month,
    year,
    periodLabel: getReportingPeriodLabel(month, year),
    summary: {
      totalClubs: districtSummary.total,
      completedClubs: districtSummary.completed,
      incompleteClubs: districtSummary.incomplete,
      totalEvents,
      newMembers,
      duesPaidClubs,
      duesMembers,
    },
    zones,
    avenues,
    perfectZones,
  };
}

/** Exported for tests / reuse — clubs that fully completed monthly reporting. */
export function completedClubsByZone(rows: ClubReportingRow[]) {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.completed) continue;
    const zone = row.club.zone ?? "Unassigned";
    if (!map.has(zone)) map.set(zone, []);
    map.get(zone)!.push(row.club.name);
  }
  return map;
}
