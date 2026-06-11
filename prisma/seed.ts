import { config } from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { COUNCIL_PASSWORD, COUNCIL_USERS } from "../src/lib/council-roster-data";
import { importCouncilRoster } from "../src/lib/council-seed";
import { OFFICIAL_DISTRICT_CLUB_FILTER } from "../src/lib/district-clubs-data";
import { syncDistrictClubs } from "../src/lib/sync-district-clubs";
import { CLUB_LOGIN, SEED_ADMIN } from "./data/seed-constants";

export { CLUB_LOGIN, SEED_ADMIN };

config({ path: ".env.local" });
config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.activity.deleteMany();
  await prisma.councilScore.deleteMany();
  await prisma.councilBluebookAssignment.deleteMany();
  await prisma.monthlyReport.deleteMany();
  await prisma.reportingPeriod.deleteMany();
  await prisma.bluebookSubmission.deleteMany();
  await prisma.bluebookTask.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventGallery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.member.deleteMany();
  await prisma.club.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(SEED_ADMIN.password, 12);
  const councilHash = await bcrypt.hash(COUNCIL_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: SEED_ADMIN.name,
      email: SEED_ADMIN.email,
      password: adminHash,
      role: "DISTRICT_ADMIN",
    },
  });

  const clubSync = await syncDistrictClubs(prisma);
  const clubs = await prisma.club.findMany({
    where: OFFICIAL_DISTRICT_CLUB_FILTER,
    orderBy: { name: "asc" },
  });

  const now = new Date();

  await prisma.event.create({
    data: {
      title: "District Assembly",
      clubId: null,
      type: "DISTRICT",
      status: "UPCOMING",
      startDate: new Date("2026-07-04T10:00:00+05:30"),
      location: "District 3131",
      attendees: 0,
      serviceHours: 10,
      registrationOpensAt: new Date("2026-06-01T00:00:00+05:30"),
      registrationClosesAt: new Date("2026-07-04T23:59:59+05:30"),
      registrationUrl: "https://forms.gle/bgaP8kYZup8V3VmT9",
      maxAttendees: 300,
    },
  });

  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await importCouncilRoster(prisma);

  const councilUsers = await prisma.user.findMany({
    where: {
      email: { in: COUNCIL_USERS.map((u) => u.email.toLowerCase().trim()) },
    },
    select: { id: true, email: true, role: true, name: true },
  });

  const councilAccounts = councilUsers.map((user) => {
    const roster = COUNCIL_USERS.find(
      (c) => c.email.toLowerCase().trim() === user.email
    );
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: roster?.name ?? user.name ?? "",
      title: roster?.title ?? "",
    };
  });

  const demoClub =
    clubs.find((c) => c.charterNumber === CLUB_LOGIN.riClubId) ?? clubs[2];

  const clubLogin = await prisma.user.create({
    data: {
      name: CLUB_LOGIN.name,
      email: CLUB_LOGIN.email,
      password: councilHash,
      role: CLUB_LOGIN.role,
      clubId: demoClub.id,
    },
  });

  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month - 1, 10, 23, 59, 59, 999);
  await prisma.reportingPeriod.create({
    data: { month, year, opensAt: periodStart, closesAt: periodEnd, isActive: true },
  });

  const csvLines = [
    "Name,Email,Title,Role,Password",
    ...councilAccounts.map(
      (u) =>
        `"${u.name.replace(/"/g, '""')}","${u.email}","${u.title.replace(/"/g, '""')}","${u.role}","${COUNCIL_PASSWORD}"`
    ),
    `"${CLUB_LOGIN.name}","${CLUB_LOGIN.email}","Panvel Elite Club Login","${CLUB_LOGIN.role}","${COUNCIL_PASSWORD}"`,
    `"${SEED_ADMIN.name}","${SEED_ADMIN.email}","Technical Admin","DISTRICT_ADMIN","${SEED_ADMIN.password}"`,
  ];

  const csvPath = path.join(__dirname, "council-logins.csv");
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  console.log("Seed completed:", {
    clubs: clubs.length,
    clubSync,
    councilMembers: COUNCIL_USERS.length,
    districtEvents: 1,
    councilAccounts: councilAccounts.length,
    defaultPassword: COUNCIL_PASSWORD,
    credentialsFile: csvPath,
    keyLogins: {
      drr: "rtr.dr.karishmaawari@gmail.com",
      districtSecretary: "rtr.harshvardhan3131@gmail.com",
      reportingSecretary: "rtr.dr.aishwaryapatil@gmail.com",
      systemAdmin: `${SEED_ADMIN.email} / ${SEED_ADMIN.password}`,
      clubLogin: `${CLUB_LOGIN.email} / ${COUNCIL_PASSWORD}`,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
