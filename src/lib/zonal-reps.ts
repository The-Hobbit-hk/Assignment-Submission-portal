import { COUNCIL_USERS } from "@/lib/council-roster-data";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";

function normalizeRepName(name: string) {
  return name
    .replace(/^(PHF\.|Rtr\.|DRRE\.|Adv\.)\s*/gi, "")
    .trim()
    .toLowerCase();
}

const EMAIL_TO_ZONES: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};

  for (const zoneMeta of DISTRICT_ZONE_META) {
    for (const repName of zoneMeta.reps) {
      const normalized = normalizeRepName(repName);
      const user = COUNCIL_USERS.find((u) => normalizeRepName(u.name) === normalized);
      if (!user) continue;
      if (!map[user.email]) map[user.email] = [];
      if (!map[user.email].includes(zoneMeta.zone)) {
        map[user.email].push(zoneMeta.zone);
      }
    }
  }

  return map;
})();

export function getZonesForZonalRep(email: string): string[] {
  return EMAIL_TO_ZONES[email.toLowerCase()] ?? [];
}

export function isZonalRepresentative(email: string): boolean {
  return getZonesForZonalRep(email).length > 0;
}
