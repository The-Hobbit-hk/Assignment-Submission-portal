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
    return home === target || home.includes(target) || target.includes(home);
  });
}

export function clubSearchKeys(...names: string[]) {
  const keys = new Set<string>();
  for (const name of names) {
    const cleaned = name.replace(/^rotaract\s+club\s+of\s+/i, "").trim();
    if (cleaned.length >= 4) keys.add(cleaned);
    const spaced = cleaned.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (spaced.length >= 4) keys.add(spaced);
    for (const token of spaced.split(" ")) {
      if (token.length >= 5) keys.add(token);
    }
  }
  return [...keys];
}

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Members that belong on a club's roster UI:
 * - direct clubId membership, plus
 * - council members whose homeClub points at this club
 */
export function buildClubRosterWhere(
  club: { id: string; name: string },
  extra?: Prisma.MemberWhereInput
): Prisma.MemberWhereInput {
  const keys = clubSearchKeys(club.name);
  const homeClubOr =
    keys.length === 0
      ? undefined
      : ({
          AND: [
            { homeClub: { not: null } },
            {
              OR: keys.map((key) => ({
                homeClub: { contains: key, mode: "insensitive" as const },
              })),
            },
          ],
        } satisfies Prisma.MemberWhereInput);

  const affiliation: Prisma.MemberWhereInput = homeClubOr
    ? { OR: [{ clubId: club.id }, homeClubOr] }
    : { clubId: club.id };

  if (!extra || Object.keys(extra).length === 0) return affiliation;
  return { AND: [affiliation, extra] };
}

/** Keep only true homeClub matches (avoids loose contains false positives). */
export function filterHomeClubAffiliates<T extends { clubId: string; homeClub?: string | null }>(
  members: T[],
  club: { id: string; name: string }
) {
  return members.filter(
    (member) =>
      member.clubId === club.id || homeClubMatches(member.homeClub, club.name)
  );
}

export async function findClubRosterMembers<T extends Prisma.MemberInclude>(
  db: Db,
  club: { id: string; name: string },
  options?: {
    where?: Prisma.MemberWhereInput;
    include?: T;
    orderBy?: Prisma.MemberOrderByWithRelationInput | Prisma.MemberOrderByWithRelationInput[];
  }
) {
  const members = await db.member.findMany({
    where: buildClubRosterWhere(club, options?.where),
    include: options?.include,
    orderBy: options?.orderBy ?? [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return filterHomeClubAffiliates(members, club);
}
