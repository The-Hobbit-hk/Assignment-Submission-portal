import { COUNCIL_USERS } from "@/lib/council-roster-data";

const TREASURER_TITLE = "District Treasurer";

/** Extra treasurer emails via env (comma-separated), for accounts not in the roster. */
const EXTRA_TREASURER_EMAILS = new Set(
  (process.env.DISTRICT_TREASURER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isDistrictTreasurer(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  if (EXTRA_TREASURER_EMAILS.has(normalized)) return true;
  return COUNCIL_USERS.some(
    (user) => user.email.toLowerCase() === normalized && user.title === TREASURER_TITLE
  );
}
