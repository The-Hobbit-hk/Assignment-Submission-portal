import type { UserRole } from "@/generated/prisma/client";
import { COUNCIL_PASSWORD } from "@/lib/council-roster-data";
import { DISTRICT_CLUBS } from "@/lib/district-clubs-data";

export type ClubLoginSeed = {
  email: string;
  password: string;
  name: string;
  role: Extract<UserRole, "CLUB_PRESIDENT" | "CLUB_SECRETARY">;
  riClubId: string;
};

/** Login email domain for club portal accounts. */
export const CLUB_LOGIN_DOMAIN = "rotaract3131.org";

/** Build a readable, URL-safe slug from a club name (drops the common prefix). */
export function clubLoginSlug(clubName: string): string {
  return clubName
    .replace(/^Rotaract Club of\s+/i, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42)
    .replace(/-+$/g, "");
}

/**
 * One portal login per official district club, keyed by charter id.
 * Emails are unique (a charter-id suffix is appended on the rare slug clash).
 * Every account uses the shared initial password and must reset on first login.
 */
function buildClubPortalLogins(): ClubLoginSeed[] {
  const used = new Set<string>();
  return DISTRICT_CLUBS.map((club) => {
    let slug = clubLoginSlug(club.name);
    if (!slug || used.has(slug)) {
      slug = `${slug ? `${slug}-` : "club-"}${club.riClubId}`.slice(0, 54);
    }
    used.add(slug);
    return {
      email: `${slug}@${CLUB_LOGIN_DOMAIN}`,
      password: COUNCIL_PASSWORD,
      name: `${club.name} — Club Login`,
      role: "CLUB_PRESIDENT" as const,
      riClubId: club.riClubId,
    };
  });
}

export const CLUB_PORTAL_LOGINS: ClubLoginSeed[] = buildClubPortalLogins();
