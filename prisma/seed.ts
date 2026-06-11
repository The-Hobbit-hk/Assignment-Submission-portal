import { config } from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { COUNCIL_PASSWORD, COUNCIL_USERS } from "./data/council-users";

/** Technical system admin — created on every seed run */
export const SEED_ADMIN = {
  email: "admin@rotaract3131.org",
  password: "Admin@3131",
  name: "System Admin",
};

export const CLUB_LOGIN = {
  email: "club.mumbai@rotaract3131.org",
  password: COUNCIL_PASSWORD,
  name: "Mumbai Club Login",
  role: "CLUB_PRESIDENT" as const,
};

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

  const clubs = await Promise.all([
    prisma.club.create({
      data: {
        name: "Rotaract Club of Mumbai Central",
        charterNumber: "RAC-3131-001",
        city: "Mumbai",
        zone: "Zone A",
        status: "ACTIVE",
        description: "Serving communities in central Mumbai since 2010.",
        serviceHours: 320,
        foundedAt: new Date("2010-03-15"),
      },
    }),
    prisma.club.create({
      data: {
        name: "Rotaract Club of Pune IT",
        charterNumber: "RAC-3131-002",
        city: "Pune",
        zone: "Zone B",
        status: "ACTIVE",
        description: "Tech professionals driving social impact in Pune.",
        serviceHours: 280,
        foundedAt: new Date("2015-07-20"),
      },
    }),
    prisma.club.create({
      data: {
        name: "Rotaract Club of Nashik Hills",
        charterNumber: "RAC-3131-003",
        city: "Nashik",
        zone: "Zone C",
        status: "ACTIVE",
        description: "Community service in the Nashik region.",
        serviceHours: 195,
        foundedAt: new Date("2018-01-10"),
      },
    }),
    prisma.club.create({
      data: {
        name: "Rotaract Club of Thane East",
        charterNumber: "RAC-3131-004",
        city: "Thane",
        zone: "Zone A",
        status: "PROVISIONAL",
        description: "Newly chartered club in Thane East.",
        serviceHours: 45,
      },
    }),
  ]);

  const memberData = [
    { firstName: "Aarav", lastName: "Sharma", email: "aarav@example.com", role: "PRESIDENT" as const, points: 450, clubIdx: 0 },
    { firstName: "Priya", lastName: "Patel", email: "priya@example.com", role: "SECRETARY" as const, points: 380, clubIdx: 0 },
    { firstName: "Rohan", lastName: "Desai", email: "rohan@example.com", role: "MEMBER" as const, points: 290, clubIdx: 0 },
    { firstName: "Sneha", lastName: "Kulkarni", email: "sneha@example.com", role: "PRESIDENT" as const, points: 420, clubIdx: 1 },
    { firstName: "Vikram", lastName: "Joshi", email: "vikram@example.com", role: "TREASURER" as const, points: 310, clubIdx: 1 },
    { firstName: "Ananya", lastName: "Mehta", email: "ananya@example.com", role: "MEMBER" as const, points: 275, clubIdx: 1 },
    { firstName: "Karan", lastName: "Singh", email: "karan@example.com", role: "PRESIDENT" as const, points: 395, clubIdx: 2 },
    { firstName: "Divya", lastName: "Rao", email: "divya@example.com", role: "SECRETARY" as const, points: 340, clubIdx: 2 },
    { firstName: "Arjun", lastName: "Nair", email: "arjun@example.com", role: "MEMBER" as const, points: 220, clubIdx: 2 },
    { firstName: "Meera", lastName: "Iyer", email: "meera@example.com", role: "PRESIDENT" as const, points: 180, clubIdx: 3 },
  ];

  for (const m of memberData) {
    const member = await prisma.member.create({
      data: {
        clubId: clubs[m.clubIdx].id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        role: m.role,
        status: "ACTIVE",
        points: m.points,
        profession: "Professional",
        joinedAt: new Date(2024, Math.floor(Math.random() * 12), 1),
      },
    });

    await prisma.activity.create({
      data: {
        type: "MEMBER_JOINED",
        title: `${m.firstName} ${m.lastName} joined ${clubs[m.clubIdx].name}`,
        memberId: member.id,
        clubId: clubs[m.clubIdx].id,
      },
    });
  }

  const now = new Date();
  const events = [
    { title: "Blood Donation Drive", clubIdx: 0, type: "SERVICE" as const, days: 5, hours: 8, attendees: 45 },
    { title: "Career Fair 2026", clubIdx: 1, type: "PROFESSIONAL" as const, days: 12, hours: 6, attendees: 120 },
    { title: "District Assembly", clubIdx: null, type: "DISTRICT" as const, days: 20, hours: 10, attendees: 200 },
    { title: "Beach Cleanup", clubIdx: 2, type: "SERVICE" as const, days: -10, hours: 4, attendees: 35, status: "COMPLETED" as const },
    { title: "Leadership Workshop", clubIdx: 0, type: "TRAINING" as const, days: -25, hours: 5, attendees: 28, status: "COMPLETED" as const },
    { title: "Club Social Night", clubIdx: 1, type: "SOCIAL" as const, days: 8, hours: 3, attendees: 60 },
  ];

  for (const e of events) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + e.days);

    await prisma.event.create({
      data: {
        title: e.title,
        clubId: e.clubIdx !== null ? clubs[e.clubIdx].id : null,
        type: e.type,
        status: e.status ?? "UPCOMING",
        startDate,
        location: "District 3131",
        attendees: e.attendees,
        serviceHours: e.hours,
        budget: 15000,
      },
    });

    await prisma.activity.create({
      data: {
        type: "EVENT_CREATED",
        title: `Event "${e.title}" scheduled`,
        clubId: e.clubIdx !== null ? clubs[e.clubIdx].id : undefined,
      },
    });
  }

  for (const club of clubs) {
    await prisma.activity.create({
      data: {
        type: "CLUB_CREATED",
        title: `Club "${club.name}" registered`,
        clubId: club.id,
      },
    });
  }

  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const bluebookTasks = [
    { title: "Submit monthly report", category: "Reporting", maxScore: 50, days: 14 },
    { title: "Community service project", category: "Service", maxScore: 100, days: 30 },
    { title: "Member induction drive", category: "Membership", maxScore: 75, days: -5 },
    { title: "District meeting attendance", category: "Governance", maxScore: 40, days: 7 },
  ];

  const createdTasks = [];
  for (const t of bluebookTasks) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + t.days);
    const task = await prisma.bluebookTask.create({
      data: { title: t.title, category: t.category, maxScore: t.maxScore, dueDate, month, year },
    });
    createdTasks.push(task);
    for (const club of clubs.slice(0, 3)) {
      const isExpired = dueDate < now;
      await prisma.bluebookSubmission.create({
        data: {
          taskId: task.id,
          clubId: club.id,
          status: isExpired ? "EXPIRED" : "APPROVED",
          allocatedScore: isExpired ? 0 : Math.floor(t.maxScore * 0.8),
          submittedAt: new Date(),
          reviewedAt: new Date(),
          reviewerComment: isExpired ? "Submitted after deadline" : "Well documented submission.",
        },
      });
    }
  }

  const councilAccounts: { id: string; email: string; role: string; name: string; title: string }[] = [];

  for (const councilUser of COUNCIL_USERS) {
    const user = await prisma.user.create({
      data: {
        name: councilUser.name,
        email: councilUser.email.toLowerCase().trim(),
        password: councilHash,
        role: councilUser.role,
      },
    });
    councilAccounts.push({
      id: user.id,
      email: user.email,
      role: user.role,
      name: councilUser.name,
      title: councilUser.title,
    });
  }

  const clubLogin = await prisma.user.create({
    data: {
      name: CLUB_LOGIN.name,
      email: CLUB_LOGIN.email,
      password: councilHash,
      role: CLUB_LOGIN.role,
      clubId: clubs[0].id,
    },
  });

  const dsr = councilAccounts.find((u) => u.role === "DISTRICT_SECRETARY");
  const assignees = councilAccounts
    .filter((u) => u.role === "COUNCIL_MEMBER")
    .slice(0, 4);

  if (dsr) {
    for (const task of createdTasks.slice(0, 2)) {
      for (const assignee of assignees) {
        await prisma.councilBluebookAssignment.create({
          data: {
            taskId: task.id,
            assigneeId: assignee.id,
            assignedById: dsr.id,
          },
        });
      }
    }
  }

  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month - 1, 10, 23, 59, 59, 999);
  await prisma.reportingPeriod.create({
    data: { month, year, opensAt: periodStart, closesAt: periodEnd, isActive: true },
  });

  await prisma.monthlyReport.create({
    data: {
      type: "ADMIN",
      month,
      year,
      clubId: clubs[0].id,
      submittedById: clubLogin.id,
      newMembers: 5,
      resolutionPassed: "yes",
      districtDuesPaid: "yes",
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await prisma.monthlyReport.create({
    data: {
      type: "EVENTS",
      month,
      year,
      clubId: clubs[0].id,
      submittedById: clubLogin.id,
      hostClub: "no",
      districtEventAttendance: "Attended District Assembly and Career Fair.",
      newsletterEvent: "Blood Donation Drive",
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  const csvLines = [
    "Name,Email,Title,Role,Password",
    ...councilAccounts.map(
      (u) =>
        `"${u.name.replace(/"/g, '""')}","${u.email}","${u.title.replace(/"/g, '""')}","${u.role}","${COUNCIL_PASSWORD}"`
    ),
    `"${CLUB_LOGIN.name}","${CLUB_LOGIN.email}","Club Demo Login","${CLUB_LOGIN.role}","${COUNCIL_PASSWORD}"`,
    `"${SEED_ADMIN.name}","${SEED_ADMIN.email}","Technical Admin","DISTRICT_ADMIN","${SEED_ADMIN.password}"`,
  ];

  const csvPath = path.join(__dirname, "council-logins.csv");
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  console.log("Seed completed:", {
    clubs: clubs.length,
    members: memberData.length,
    events: events.length,
    bluebookTasks: bluebookTasks.length,
    councilAccounts: councilAccounts.length,
    defaultPassword: COUNCIL_PASSWORD,
    credentialsFile: csvPath,
    keyLogins: {
      drr: "rtr.dr.karishmaawari@gmail.com",
      districtSecretary: "rtr.harshvardhan3131@gmail.com",
      reportingSecretary: "rtr.dr.aishwaryapatil@gmail.com",
      systemAdmin: `${SEED_ADMIN.email} / ${SEED_ADMIN.password}`,
      clubDemo: `${CLUB_LOGIN.email} / ${COUNCIL_PASSWORD}`,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
