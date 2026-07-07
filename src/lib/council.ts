import type { CouncilEntityType, Prisma } from "@/generated/prisma/client";
import { runWithTtl } from "@/lib/cache";
import { COUNCIL_MEMBER_FILTER, DISTRICT_COUNCIL_CLUB } from "@/lib/council-roster-data";
import {
  OFFICIAL_DISTRICT_CLUB_FILTER,
  OFFICIAL_ROTARACT_MEMBER_FILTER,
} from "@/lib/district-clubs-data";
import { rotaryYearMonths, rotaryYearOfMonth } from "@/lib/rotary-year";

export function getBadge(score: number): string | null {
  if (score >= 400) return "Gold";
  if (score >= 300) return "Silver";
  if (score >= 200) return "Bronze";
  if (score >= 100) return "Rising Star";
  return null;
}

export function getTrendLabel(trend: number): "up" | "down" | "neutral" {
  if (trend > 0) return "up";
  if (trend < 0) return "down";
  return "neutral";
}

export async function ensureCouncilScoresSynced(
  prisma: typeof import("@/lib/prisma").prisma,
  month: number,
  year: number,
  force = false
) {
  await runWithTtl(
    `council-sync:council-roster:${month}:${year}`,
    () => syncCouncilScores(prisma, month, year),
    { force }
  );
}

export async function syncCouncilScores(
  prisma: typeof import("@/lib/prisma").prisma,
  month: number,
  year: number
) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [clubs, bluebookByClub, memberPointsByClub, members, councilBluebookByUser, prevScores] =
    await Promise.all([
      prisma.club.findMany({
        where: { ...OFFICIAL_DISTRICT_CLUB_FILTER, status: "ACTIVE" },
        select: { id: true },
      }),
      prisma.bluebookSubmission.groupBy({
        by: ["clubId"],
        where: { status: "APPROVED", task: { month, year } },
        _sum: { allocatedScore: true },
      }),
      prisma.member.groupBy({
        by: ["clubId"],
        where: { status: "ACTIVE", ...OFFICIAL_ROTARACT_MEMBER_FILTER },
        _sum: { points: true },
      }),
      prisma.member.findMany({
        where: { ...COUNCIL_MEMBER_FILTER },
        select: { id: true, userId: true, points: true },
      }),
      prisma.councilBluebookAssignment.groupBy({
        by: ["assigneeId"],
        where: { task: { month, year } },
        _sum: { allocatedScore: true },
      }),
      prisma.councilScore.findMany({
        where: { month: prevMonth, year: prevYear },
        select: { entityType: true, entityId: true, score: true },
      }),
    ]);

  const bluebookMap = new Map(
    bluebookByClub.map((b) => [b.clubId, b._sum.allocatedScore ?? 0])
  );
  const memberPointsMap = new Map(
    memberPointsByClub.map((m) => [m.clubId, m._sum.points ?? 0])
  );
  const prevMap = new Map(
    prevScores.map((p) => [`${p.entityType}:${p.entityId}`, p.score])
  );
  const councilBluebookMap = new Map(
    councilBluebookByUser.map((row) => [row.assigneeId, row._sum.allocatedScore ?? 0])
  );

  const clubScores = clubs
    .map((club) => {
      const bluebook = bluebookMap.get(club.id) ?? 0;
      const memberPts = memberPointsMap.get(club.id) ?? 0;
      return {
        entityId: club.id,
        clubId: club.id,
        score: bluebook + Math.round(memberPts * 0.1),
      };
    })
    .sort((a, b) => b.score - a.score);

  const clubRecords: Prisma.CouncilScoreCreateManyInput[] = clubScores.map(
    (c, i) => ({
      entityType: "CLUB",
      entityId: c.entityId,
      clubId: c.clubId,
      month,
      year,
      score: c.score,
      rank: i + 1,
      badge: getBadge(c.score),
      trend: c.score - (prevMap.get(`CLUB:${c.entityId}`) ?? 0),
    })
  );

  const scoredMembers = members
    .map((m) => ({
      id: m.id,
      score: m.userId ? (councilBluebookMap.get(m.userId) ?? 0) : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const memberRecords: Prisma.CouncilScoreCreateManyInput[] = scoredMembers.map(
    (m, i) => ({
      entityType: "MEMBER",
      entityId: m.id,
      memberId: m.id,
      month,
      year,
      score: m.score,
      rank: i + 1,
      badge: getBadge(m.score),
      trend: m.score - (prevMap.get(`MEMBER:${m.id}`) ?? 0),
    })
  );

  await prisma.$transaction([
    prisma.councilScore.deleteMany({
      where: { month, year, entityType: "CLUB" },
    }),
    prisma.councilScore.deleteMany({
      where: { month, year, entityType: "MEMBER" },
    }),
    ...(clubRecords.length
      ? [prisma.councilScore.createMany({ data: clubRecords })]
      : []),
    ...(memberRecords.length
      ? [prisma.councilScore.createMany({ data: memberRecords })]
      : []),
  ]);
}

export function serializeCouncilEntry(entry: {
  id: string;
  entityType: CouncilEntityType;
  entityId: string;
  month: number;
  year: number;
  score: number;
  rank: number | null;
  badge: string | null;
  trend: number;
  club?: { id: string; name: string } | null;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    homeClub?: string | null;
    club?: { name: string };
  } | null;
}) {
  const name =
    entry.entityType === "CLUB"
      ? (entry.club?.name ?? "Unknown Club")
      : entry.member
        ? `${entry.member.firstName} ${entry.member.lastName}`
        : "Unknown Member";

  return {
    id: entry.id,
    entityType: entry.entityType,
    entityId: entry.entityId,
    name,
    email: entry.member?.email ?? null,
    clubName:
      entry.member?.homeClub ?? entry.member?.club?.name ?? entry.club?.name ?? null,
    month: entry.month,
    year: entry.year,
    score: entry.score,
    rank: entry.rank,
    badge: entry.badge,
    trend: entry.trend,
    trendDirection: getTrendLabel(entry.trend),
  };
}

const councilInclude = {
  club: { select: { id: true, name: true } },
  member: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      homeClub: true,
      club: { select: { name: true } },
    },
  },
} as const;

export async function fetchCouncilPodium(
  prisma: typeof import("@/lib/prisma").prisma,
  entityType: CouncilEntityType,
  month: number,
  year: number
) {
  const top3 = await prisma.councilScore.findMany({
    where: { entityType, month, year },
    orderBy: { rank: "asc" },
    take: 3,
    include: councilInclude,
  });
  return top3.map(serializeCouncilEntry);
}

export async function fetchCouncilLeaderboard(
  prisma: typeof import("@/lib/prisma").prisma,
  params: {
    entityType: CouncilEntityType;
    month: number;
    year: number;
    period: string;
    search: string;
    page: number;
    limit: number;
    skip: number;
  }
) {
  const { entityType, month, year, period, search, page, limit, skip } = params;
  const yearOnly = period === "yearly";
  const councilMemberScope =
    entityType === "MEMBER"
      ? {
          member: {
            club: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
            ...(search
              ? {
                  OR: [
                    {
                      firstName: { contains: search, mode: "insensitive" as const },
                    },
                    {
                      lastName: { contains: search, mode: "insensitive" as const },
                    },
                  ],
                }
              : {}),
          },
        }
      : search
        ? { club: { name: { contains: search, mode: "insensitive" as const } } }
        : {};

  // Yearly view: aggregate every monthly CouncilScore in the Rotary year
  // (Jul -> Jun) that contains the selected month, summing per entity.
  if (yearOnly) {
    const pairs = rotaryYearMonths(rotaryYearOfMonth(month, year));
    const rows = await prisma.councilScore.findMany({
      where: {
        entityType,
        OR: pairs.map((p) => ({ month: p.month, year: p.year })),
        ...councilMemberScope,
      },
      include: councilInclude,
    });

    const grouped = new Map<string, { representative: (typeof rows)[number]; score: number; trend: number }>();
    for (const row of rows) {
      const existing = grouped.get(row.entityId);
      if (existing) {
        existing.score += row.score;
        existing.trend += row.trend;
        // Keep the most recent row for its relation data / id.
        if (row.year > existing.representative.year || (row.year === existing.representative.year && row.month > existing.representative.month)) {
          existing.representative = row;
        }
      } else {
        grouped.set(row.entityId, { representative: row, score: row.score, trend: row.trend });
      }
    }

    const ranked = [...grouped.values()]
      .sort((a, b) => b.score - a.score)
      .map((group, index) => ({
        ...group.representative,
        score: group.score,
        trend: group.trend,
        badge: getBadge(group.score),
        rank: index + 1,
      }));

    return {
      entries: ranked.slice(skip, skip + limit),
      total: ranked.length,
      page,
      limit,
    };
  }

  const where = {
    entityType,
    month,
    year,
    ...councilMemberScope,
  };

  const [entries, total] = await Promise.all([
    prisma.councilScore.findMany({
      where,
      skip,
      take: limit,
      orderBy: { rank: "asc" },
      include: councilInclude,
    }),
    prisma.councilScore.count({ where }),
  ]);

  return { entries, total, page, limit };
}
