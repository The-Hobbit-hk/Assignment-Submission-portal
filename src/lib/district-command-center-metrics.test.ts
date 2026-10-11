import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCommandAlerts,
  completionPercent,
  rankCitationStandings,
  summarizeDistrictDues,
  summarizeZones,
  type ClubReportInput,
} from "./district-command-center-metrics";

const zones = ["Zone 1", "Zone 2"];

function club(partial: Partial<ClubReportInput> & Pick<ClubReportInput, "clubId" | "zone">): ClubReportInput {
  return {
    clubName: partial.clubId,
    active: true,
    admin: "NOT SUBMITTED",
    events: "NOT SUBMITTED",
    districtDuesPaid: null,
    ...partial,
  };
}

test("active reporting completion ignores inactive clubs and duplicate-safe rows", () => {
  const rows = [
    club({ clubId: "a", zone: "Zone 1", admin: "SUBMITTED", events: "SUBMITTED" }),
    club({ clubId: "b", zone: "Zone 1", admin: "SUBMITTED", events: "DRAFT" }),
    club({ clubId: "c", zone: "Zone 1", active: false, admin: "SUBMITTED", events: "SUBMITTED" }),
    club({ clubId: "d", zone: "Zone 2" }),
  ];
  const summary = summarizeZones(rows, zones);
  assert.equal(summary[0]?.eligible, 2);
  assert.equal(summary[0]?.completed, 1);
  assert.equal(summary[0]?.stillOpen, 1);
  assert.equal(summary[0]?.completionPercent, 50);
  assert.equal(summary[1]?.completionPercent, 0);
});

test("zero eligible clubs do not divide by zero", () => {
  assert.equal(completionPercent(0, 0), null);
  const summary = summarizeZones([], zones);
  assert.equal(summary[0]?.completionPercent, null);
  assert.equal(summary[0]?.eligible, 0);
});

test("district dues counts stay separate from invented money", () => {
  const summary = summarizeDistrictDues([
    { active: true, districtDuesPaid: "yes", declaredAmount: 1200 },
    { active: true, districtDuesPaid: "yes", declaredAmount: null },
    { active: true, districtDuesPaid: "no", declaredAmount: 9999 },
    { active: true, districtDuesPaid: null, declaredAmount: 50 },
    { active: false, districtDuesPaid: "yes", declaredAmount: 5000 },
  ]);
  assert.equal(summary.clubsFullyMarkedPaid, 2);
  assert.equal(summary.clubsMarkedUnpaid, 1);
  assert.equal(summary.clubsNotMarked, 1);
  assert.equal(summary.declaredAmountInr, 1200);
});

test("missing declared amounts stay unavailable", () => {
  const summary = summarizeDistrictDues([{ active: true, districtDuesPaid: "yes", declaredAmount: null }]);
  assert.equal(summary.declaredAmountAvailable, false);
  assert.equal(summary.declaredAmountInr, null);
});

test("citation ties share a rank and pending points are not awarded", () => {
  const rows = rankCitationStandings([
    {
      clubId: "a",
      clubName: "Alpha",
      zone: "Zone 1",
      assignments: [
        { status: "APPROVED", awardedPoints: 10, definitionPoints: 10 },
        { status: "SUBMITTED", awardedPoints: 0, definitionPoints: 5 },
      ],
    },
    {
      clubId: "b",
      clubName: "Beta",
      zone: "Zone 2",
      assignments: [{ status: "APPROVED", awardedPoints: 10, definitionPoints: 10 }],
    },
    {
      clubId: "c",
      clubName: "Gamma",
      zone: "Zone 1",
      assignments: [{ status: "REJECTED", awardedPoints: 0, definitionPoints: 10 }],
    },
  ]);
  assert.equal(rows[0]?.rank, 1);
  assert.equal(rows[1]?.rank, 1);
  assert.equal(rows[2]?.rank, 3);
  assert.equal(rows.find((row) => row.clubId === "a")?.pendingCount, 1);
  assert.equal(rows.find((row) => row.clubId === "a")?.approvedPoints, 10);
  assert.equal(rows.find((row) => row.clubId === "c")?.rejectedCount, 1);
  assert.equal(rows.find((row) => row.clubId === "c")?.approvedPoints, 0);
});

test("alerts distinguish overdue, due soon, and pending without duplicates", () => {
  const closesAt = new Date("2026-10-10T18:29:59.999Z");
  const overdue = buildCommandAlerts({
    now: new Date("2026-10-11T00:00:00.000Z"),
    closesAt,
    periodLabel: "SEPTEMBER 2026",
    incompleteClubs: [{ clubId: "a", clubName: "Alpha", zone: "Zone 1" }],
    pendingCitationReviews: 2,
    districtDuesOpenClubs: 4,
    riCitationOverdueClubs: 0,
    riCitationDueSoonClubs: 0,
    clubReportsHref: "/reports",
    citationReviewHref: "/citations",
    districtDuesHref: "/dues",
  });
  assert.deepEqual(
    overdue.map((alert) => alert.id),
    ["reporting-overdue", "citations-pending", "district-dues-overdue"]
  );

  const dueSoon = buildCommandAlerts({
    now: new Date("2026-10-08T18:29:59.999Z"),
    closesAt,
    periodLabel: "SEPTEMBER 2026",
    incompleteClubs: [{ clubId: "a", clubName: "Alpha", zone: "Zone 1" }],
    pendingCitationReviews: 0,
    districtDuesOpenClubs: 4,
    riCitationOverdueClubs: 1,
    riCitationDueSoonClubs: 3,
    clubReportsHref: "/reports",
    citationReviewHref: "/citations",
    districtDuesHref: "/dues",
  });
  assert.equal(dueSoon[0]?.severity, "due_soon");
  assert.equal(dueSoon.some((alert) => alert.id === "district-dues-overdue"), false);
  assert.equal(dueSoon.some((alert) => alert.id === "ri-dues-citation-overdue"), true);
  assert.equal(dueSoon.some((alert) => alert.id === "ri-dues-citation-due-soon"), false);
});

test("resolved reporting produces no reporting alert", () => {
  const alerts = buildCommandAlerts({
    now: new Date("2026-10-11T00:00:00.000Z"),
    closesAt: new Date("2026-10-10T18:29:59.999Z"),
    periodLabel: "SEPTEMBER 2026",
    incompleteClubs: [],
    pendingCitationReviews: 0,
    districtDuesOpenClubs: 0,
    riCitationOverdueClubs: 0,
    riCitationDueSoonClubs: 0,
    clubReportsHref: "/reports",
    citationReviewHref: "/citations",
    districtDuesHref: "/dues",
  });
  assert.equal(alerts.length, 0);
});
