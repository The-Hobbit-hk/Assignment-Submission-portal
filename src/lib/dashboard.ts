import { unstable_cache } from "next/cache";
import { OFFICIAL_ROTARACT_MEMBER_FILTER } from "@/lib/district-clubs-data";
import { getPublicCalendarEvents } from "@/lib/public-site-data";
import { prisma } from "@/lib/prisma";
import type { DashboardData } from "@/types/dashboard";

async function fetchDashboardOverview(): Promise<
  Pick<DashboardData, "calendarEvents" | "leaderboard">
> {
  const [publicEvents, leaderboardMembers] = await Promise.all([
    // Same source as the public /calendar page (DB + Google Calendar sync).
    getPublicCalendarEvents(),
    prisma.member.findMany({
      where: { status: "ACTIVE", ...OFFICIAL_ROTARACT_MEMBER_FILTER },
      orderBy: { points: "desc" },
      take: 3,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        points: true,
        avatar: true,
        club: { select: { name: true } },
      },
    }),
  ]);

  return {
    calendarEvents: publicEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate.toISOString(),
      type: e.type,
    })),
    leaderboard: leaderboardMembers.map((m, i) => ({
      rank: i + 1,
      memberId: m.id,
      name: `${m.firstName} ${m.lastName}`,
      clubName: m.club.name,
      points: m.points,
      avatar: m.avatar,
    })),
  };
}

const getCachedDashboardOverview = unstable_cache(
  fetchDashboardOverview,
  ["dashboard-overview", "public-calendar-v2"],
  { revalidate: 120, tags: ["public-events"] }
);

export async function getDashboardData(): Promise<DashboardData> {
  const overview = await getCachedDashboardOverview();
  return {
    ...overview,
    kpis: [],
    statistics: [],
    upcomingEvents: [],
    recentActivity: [],
  };
}
