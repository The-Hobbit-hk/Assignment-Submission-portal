/**
 * Export every login (admin + council + club portals) to shareable files.
 * Offline — reads the seed data, no DB connection required.
 *
 *   npm run db:export-credentials
 *
 * Output:
 *   output/login-credentials.csv
 *   output/login-credentials.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SEED_ADMIN } from "../prisma/data/seed-constants";
import { COUNCIL_USERS, COUNCIL_PASSWORD } from "../src/lib/council-roster-data";
import { CLUB_PORTAL_LOGINS } from "../src/lib/club-logins-data";
import { DISTRICT_CLUBS } from "../src/lib/district-clubs-data";

type Row = {
  category: string;
  group: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

const zoneByCharter = new Map(DISTRICT_CLUBS.map((c) => [c.riClubId, c.zone]));

const rows: Row[] = [];

// 1. Admin
rows.push({
  category: "Admin",
  group: "System",
  name: SEED_ADMIN.name,
  email: SEED_ADMIN.email,
  password: SEED_ADMIN.password,
  role: "DISTRICT_ADMIN",
});

// 2. Council
for (const u of COUNCIL_USERS) {
  rows.push({
    category: "Council",
    group: u.title,
    name: u.name,
    email: u.email.toLowerCase().trim(),
    password: COUNCIL_PASSWORD,
    role: u.role,
  });
}

// 3. Club portal logins
for (const login of CLUB_PORTAL_LOGINS) {
  rows.push({
    category: "Club",
    group: zoneByCharter.get(login.riClubId) ?? "",
    name: login.name.replace(/ — Club Login$/, ""),
    email: login.email,
    password: login.password,
    role: login.role,
  });
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const csv = [
  "Category,Group/Zone,Name/Club,Login Email,Password,Role,Must reset on first login",
  ...rows.map((r) =>
    [r.category, r.group, r.name, r.email, r.password, r.role, r.category === "Admin" ? "No" : "Yes"]
      .map(csvCell)
      .join(",")
  ),
].join("\r\n");

const md: string[] = [];
md.push("# Rotaract District 3131 — Login Credentials");
md.push("");
md.push("> Every council & club account must reset its password on first login.");
md.push("");
md.push("## System Admin");
md.push("| Name | Email | Password |");
md.push("| --- | --- | --- |");
md.push(`| ${SEED_ADMIN.name} | ${SEED_ADMIN.email} | ${SEED_ADMIN.password} |`);
md.push("");
md.push(`## District Council (${COUNCIL_USERS.length}) — password: \`${COUNCIL_PASSWORD}\``);
md.push("| # | Name | Position | Email |");
md.push("| --- | --- | --- | --- |");
COUNCIL_USERS.forEach((u, i) => {
  md.push(`| ${i + 1} | ${u.name} | ${u.title} | ${u.email.toLowerCase().trim()} |`);
});
md.push("");
md.push(`## Club Portal Logins (${CLUB_PORTAL_LOGINS.length}) — password: \`${COUNCIL_PASSWORD}\``);
md.push("| # | Zone | Club | Email |");
md.push("| --- | --- | --- | --- |");
CLUB_PORTAL_LOGINS.forEach((login, i) => {
  const club = login.name.replace(/ — Club Login$/, "");
  md.push(`| ${i + 1} | ${zoneByCharter.get(login.riClubId) ?? ""} | ${club} | ${login.email} |`);
});
md.push("");

const outDir = join(process.cwd(), "output");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "login-credentials.csv"), csv, "utf8");
writeFileSync(join(outDir, "login-credentials.md"), md.join("\n"), "utf8");

console.log(`Wrote ${rows.length} credentials:`);
console.log(`  output/login-credentials.csv`);
console.log(`  output/login-credentials.md`);
console.log(
  `  (1 admin, ${COUNCIL_USERS.length} council, ${CLUB_PORTAL_LOGINS.length} clubs)`
);
