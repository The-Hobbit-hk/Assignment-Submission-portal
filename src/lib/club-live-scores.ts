import { prisma } from "@/lib/prisma";
import {
  ensureCouncilScoresSynced,
  fetchCouncilLeaderboard,
  serializeCouncilEntry,
} from "@/lib/council";
import { getRotaryYearLabel, rotaryYearMonths, rotaryYearOfMonth } from "@/lib/rotary-year";
import { istCalendarParts } from "@/lib/timezone";

export type PublicClubScore = {
  clubId: string;
  name: string;
  zone: string | null;
  score: number;
  rank: number | null;
  badge: string | null;
};

/** Rotary-year club live scores, including citation points awarded in that year. */
export async function getPublicClubLeaderboard(): Promise<{
  label: string;
  clubs: PublicClubScore[];
}> {
  const parts = istCalendarParts();
  const startYear = rotaryYearOfMonth(parts.month, parts.year);
  const months = rotaryYearMonths(startYear).filter((item) => {
    if (item.year < parts.year) return true;
    if (item.year > parts.year) return false;
    return item.month <= parts.month;
  });

  await Promise.all(
    months.map((item) => ensureCouncilScoresSynced(prisma, item.month, item.year))
  );

  const board = await fetchCouncilLeaderboard(prisma, {
    entityType: "CLUB",
    month: parts.month,
    year: parts.year,
    period: "yearly",
    search: "",
    page: 1,
    limit: 300,
    skip: 0,
  });

  const clubs = await prisma.club.findMany({
    where: { id: { in: board.entries.map((entry) => entry.entityId) } },
    select: { id: true, zone: true },
  });
  const zoneById = new Map(clubs.map((club) => [club.id, club.zone]));

  return {
    label: getRotaryYearLabel(startYear),
    clubs: board.entries.map((entry) => {
      const serialized = serializeCouncilEntry(entry);
      return {
        clubId: serialized.entityId,
        name: serialized.name,
        zone: zoneById.get(serialized.entityId) ?? null,
        score: serialized.score,
        rank: serialized.rank,
        badge: serialized.badge,
      };
    }),
  };
}
