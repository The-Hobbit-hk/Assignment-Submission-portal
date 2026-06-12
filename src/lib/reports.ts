import { OFFICIAL_DISTRICT_CLUB_FILTER } from "@/lib/district-clubs-data";
import { prisma } from "@/lib/prisma";
import { getOrCreateCycle } from "@/lib/bluebook-cycle";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";
import {
  buildCouncilMemberRows,
  summarizeCouncilBluebook,
} from "@/lib/council-bluebook-status";

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
    where: OFFICIAL_DISTRICT_CLUB_FILTER,
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

export async function getCouncilBluebookReportData(month?: number, year?: number) {
  const m = month ?? new Date().getMonth() + 1;
  const y = year ?? new Date().getFullYear();
  const cycle = await getOrCreateCycle(prisma, m, y);

  const [members, assignments, reports] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COUNCIL_MEMBER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.councilBluebookAssignment.findMany({
      where: { task: { month: m, year: y } },
      include: {
        task: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ assignee: { name: "asc" } }, { task: { dueDate: "asc" } }],
    }),
    prisma.councilBluebookReport.findMany({
      where: { cycleId: cycle.id },
      select: { assigneeId: true, status: true, submittedAt: true },
    }),
  ]);

  const reportsByAssignee = Object.fromEntries(
    reports.map((r) => [r.assigneeId, { status: r.status }])
  );
  const memberRows = buildCouncilMemberRows(
    members,
    assignments.map(serializeCouncilAssignment),
    reportsByAssignee
  );
  const summary = summarizeCouncilBluebook(memberRows, reports, cycle.closesAt);

  const memberHeaders = [
    "Council Member",
    "Email",
    "Tasks Assigned",
    "Submission Status",
    "Review Status",
    "Points Awarded",
    "Points Possible",
    "Score %",
  ];
  const memberRowsData = memberRows
    .filter((row) => row.assignedCount > 0)
    .map((row) => [
      row.member.name ?? row.member.email,
      row.member.email,
      row.assignedCount,
      row.submissionStatusLabel,
      row.reviewStatusLabel,
      row.pointsAwarded,
      row.pointsPossible,
      row.percentageScore != null ? `${row.percentageScore}%` : "—",
    ]);

  const categoryMap = new Map<
    string,
    { tasks: number; awarded: number; possible: number }
  >();
  for (const a of assignments) {
    const cat = a.task.category;
    const entry = categoryMap.get(cat) ?? { tasks: 0, awarded: 0, possible: 0 };
    entry.tasks += 1;
    entry.awarded += a.allocatedScore;
    entry.possible += a.task.maxScore;
    categoryMap.set(cat, entry);
  }

  const deptHeaders = ["Department", "Tasks", "Points Awarded", "Points Possible", "Score %"];
  const deptRows = [...categoryMap.entries()].map(([cat, stats]) => [
    cat,
    stats.tasks,
    stats.awarded,
    stats.possible,
    stats.possible > 0 ? `${Math.round((stats.awarded / stats.possible) * 100)}%` : "—",
  ]);

  const analyticsHeaders = ["Metric", "Value"];
  const analyticsRows = [
    ["Period", `${m}/${y}`],
    ["Pending submissions", summary.pendingSubmissions],
    ["Late submissions", summary.lateSubmissions],
    ["Under review", summary.pendingReview],
    ["Reviewed", summary.reviewedReports],
    ["Total tasks", summary.totalAssignments],
  ];

  const headers = [
    ...memberHeaders,
    "",
    ...deptHeaders,
    "",
    ...analyticsHeaders,
  ];
  const maxLen = Math.max(memberRowsData.length, deptRows.length, analyticsRows.length);
  const rows: (string | number | null)[][] = [];
  for (let i = 0; i < maxLen; i++) {
    const member = memberRowsData[i];
    const dept = deptRows[i];
    const analytics = analyticsRows[i];
    rows.push([
      ...(member ?? Array(memberHeaders.length).fill("")),
      "",
      ...(dept ?? Array(deptHeaders.length).fill("")),
      "",
      ...(analytics ?? Array(analyticsHeaders.length).fill("")),
    ]);
  }

  return {
    title: `Council Blue Book Report — ${m}/${y}`,
    headers,
    rows,
  };
}

export type ReportType =
  | "members"
  | "clubs"
  | "events"
  | "bluebook"
  | "council-bluebook"
  | "performance";

export async function getReportData(type: ReportType, month?: number, year?: number) {
  switch (type) {
    case "members": return getMemberReportData();
    case "clubs": return getClubReportData();
    case "events": return getEventReportData();
    case "bluebook": return getBluebookReportData(month, year);
    case "council-bluebook": return getCouncilBluebookReportData(month, year);
    case "performance": return getPerformanceReportData();
  }
}
