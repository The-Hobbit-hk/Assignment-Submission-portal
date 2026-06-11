import { prisma } from "@/lib/prisma";

export async function getMemberReportData() {
  const members = await prisma.member.findMany({
    orderBy: { lastName: "asc" },
    include: { club: { select: { name: true } } },
  });
  const headers = ["Name", "Email", "Club", "Role", "Status", "Points", "Joined"];
  const rows = members.map((m) => [
    `${m.firstName} ${m.lastName}`,
    m.email,
    m.club.name,
    m.role,
    m.status,
    m.points,
    m.joinedAt.toLocaleDateString(),
  ]);
  return { title: "Member Report — District 3131", headers, rows };
}

export async function getClubReportData() {
  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { members: true, events: true } } },
  });
  const headers = ["Club", "City", "Zone", "Status", "Members", "Events", "Service Hours"];
  const rows = clubs.map((c) => [
    c.name,
    c.city ?? "",
    c.zone ?? "",
    c.status,
    c._count.members,
    c._count.events,
    c.serviceHours,
  ]);
  return { title: "Club Report — District 3131", headers, rows };
}

export async function getEventReportData() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { club: { select: { name: true } }, _count: { select: { registrations: true } } },
  });
  const headers = ["Title", "Type", "Status", "Date", "Club", "Attendees", "Registrations", "Service Hours"];
  const rows = events.map((e) => [
    e.title,
    e.type,
    e.status,
    e.startDate.toLocaleDateString(),
    e.club?.name ?? "District",
    e.attendees,
    e._count.registrations,
    e.serviceHours,
  ]);
  return { title: "Event Report — District 3131", headers, rows };
}

export async function getBluebookReportData(month?: number, year?: number) {
  const m = month ?? new Date().getMonth() + 1;
  const y = year ?? new Date().getFullYear();
  const submissions = await prisma.bluebookSubmission.findMany({
    where: { task: { month: m, year: y } },
    include: {
      task: { select: { title: true, category: true, maxScore: true } },
      club: { select: { name: true } },
    },
  });
  const headers = ["Task", "Category", "Club", "Status", "Score", "Max Score", "Reviewed"];
  const rows = submissions.map((s) => [
    s.task.title,
    s.task.category,
    s.club.name,
    s.status,
    s.allocatedScore,
    s.task.maxScore,
    s.reviewedAt?.toLocaleDateString() ?? "—",
  ]);
  return { title: `Bluebook Report — ${m}/${y}`, headers, rows };
}

export async function getPerformanceReportData() {
  const scores = await prisma.councilScore.findMany({
    where: { entityType: "CLUB" },
    orderBy: [{ year: "desc" }, { month: "desc" }, { rank: "asc" }],
    include: { club: { select: { name: true } } },
  });
  const headers = ["Club", "Month", "Year", "Score", "Rank", "Badge", "Trend"];
  const rows = scores.map((s) => [
    s.club?.name ?? "",
    s.month,
    s.year,
    s.score,
    s.rank ?? "",
    s.badge ?? "",
    s.trend,
  ]);
  return { title: "Performance Report — District 3131", headers, rows };
}

export type ReportType = "members" | "clubs" | "events" | "bluebook" | "performance";

export async function getReportData(type: ReportType, month?: number, year?: number) {
  switch (type) {
    case "members": return getMemberReportData();
    case "clubs": return getClubReportData();
    case "events": return getEventReportData();
    case "bluebook": return getBluebookReportData(month, year);
    case "performance": return getPerformanceReportData();
  }
}
