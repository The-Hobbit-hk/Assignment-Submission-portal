/**
 * Print the full club portal login sheet (offline — no DB needed).
 *
 *   npm run db:print-club-logins
 */
import { CLUB_PORTAL_LOGINS } from "../src/lib/club-logins-data";
import { DISTRICT_CLUBS } from "../src/lib/district-clubs-data";

const zoneByCharter = new Map(DISTRICT_CLUBS.map((c) => [c.riClubId, c.zone]));

console.log(`Total club logins: ${CLUB_PORTAL_LOGINS.length}\n`);
console.log("Zone\tClub\tLogin email\tCharter ID");
for (const login of CLUB_PORTAL_LOGINS) {
  const clubName = login.name.replace(/ — Club Login$/, "");
  const zone = zoneByCharter.get(login.riClubId) ?? "";
  console.log(`${zone}\t${clubName}\t${login.email}\t${login.riClubId}`);
}
console.log(`\nInitial password for every club login: ${CLUB_PORTAL_LOGINS[0]?.password}`);
