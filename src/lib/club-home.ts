import type { Prisma, PrismaClient } from "@/generated/prisma/client";

/** Strip "Rotaract Club of" and normalize punctuation for club-name compares. */
export function normalizeClubLabel(name: string) {
  return name
    .toLowerCase()
    .replace(/^rotaract\s+club\s+of\s+/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a council member's display-only homeClub is this club. */
export function homeClubMatches(
  homeClub: string | null | undefined,
  ...clubNames: string[]
) {
  if (!homeClub) return false;
  const home = normalizeClubLabel(homeClub);
  if (!home) return false;
  return clubNames.some((name) => {
    const target = normalizeClubLabel(name);
    if (!target) return false;
    // Exact label only — substring matches wrongly merge distinct clubs
    // (e.g. "Aundh" vs "Aundh Smartcity").
    return home === target;
  });
}

export function clubSearchKeys(...names: string[]) {
  const keys = new Set<string>();
  for (const name of names) {
    const cleaned = name.replace(/^rotaract\s+club\s+of\s+/i, "").trim();
    if (cleaned.length >= 4) keys.add(cleaned);
    const spaced = cleaned.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (spaced.length >= 4) keys.add(spaced);
  }
  return [...keys];
}

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Members that belong on a club's roster UI: direct clubId membership only.
 * Council members (homeClub) stay on the council roster so the same person
 * is not listed twice under a club.
 */
export function buildClubRosterWhere(
  club: { id: string; name: string },
  extra?: Prisma.MemberWhereInput
): Prisma.MemberWhereInput {
  const affiliation: Prisma.MemberWhereInput = { clubId: club.id };

  if (!extra || Object.keys(extra).length === 0) return affiliation;
  return { AND: [affiliation, extra] };
}

/** Club rosters are direct members only — drop any stray council/homeClub rows. */
export function filterHomeClubAffiliates<
  T extends {
    clubId: string;
    homeClub?: string | null;
    email?: string | null;
    riId?: string | null;
  },
>(members: T[], club: { id: string; name: string }) {
  return members.filter((member) => member.clubId === club.id);
}

/** Club officers may view (not mutate) council members whose homeClub is their club. */
export function isHomeClubAffiliateOf(
  member: { homeClub?: string | null },
  clubName: string | null | undefined
) {
  return !!clubName && homeClubMatches(member.homeClub, clubName);
}

export async function findClubRosterMembers(
  db: Db,
  club: { id: string; name: string },
  options?: {
    where?: Prisma.MemberWhereInput;
    orderBy?: Prisma.MemberOrderByWithRelationInput | Prisma.MemberOrderByWithRelationInput[];
  }
) {
  const members = await db.member.findMany({
    where: buildClubRosterWhere(club, options?.where),
    orderBy: options?.orderBy ?? [{ lastName: "asc" }, { firstName: "asc" }],
    include: { club: { select: { id: true, name: true } } },
  });
  return filterHomeClubAffiliates(members, club);
}
