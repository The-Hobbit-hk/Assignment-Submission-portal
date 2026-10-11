/**
 * Pure District Command Center calculations.
 * Monthly reporting has no approval or return step: a club is complete only when
 * both the admin report and the events report are SUBMITTED.
 * Due-soon alerts use a 3-day threshold before the reporting window closes.
 * There is no separate RI dues ledger, so RI money is never invented here.
 */

export const DUE_SOON_MS = 3 * 24 * 60 * 60 * 1000;

export type ReportLabel = "SUBMITTED" | "DRAFT" | "NOT SUBMITTED";

export type ClubReportInput = {
  clubId: string;
  clubName: string;
  zone: string | null;
  active: boolean;
  admin: ReportLabel;
  events: ReportLabel;
  districtDuesPaid: "yes" | "no" | null;
};

export type ZoneReportingSummary = {
  zone: string;
  eligible: number;
  completed: number;
  adminSubmitted: number;
  eventsSubmitted: number;
  stillOpen: number;
  completionPercent: number | null;
};

export function completionPercent(completed: number, eligible: number): number | null {
  if (!Number.isFinite(eligible) || eligible <= 0) return null;
  if (!Number.isFinite(completed) || completed < 0) return null;
  return Math.round((completed / eligible) * 100);
}

export function isClubReportingComplete(row: Pick<ClubReportInput, "admin" | "events">) {
  return row.admin === "SUBMITTED" && row.events === "SUBMITTED";
}

export function summarizeZones(
  rows: ClubReportInput[],
  zones: string[]
): ZoneReportingSummary[] {
  return zones.map((zone) => {
    const inZone = rows.filter((row) => row.zone === zone && row.active);
    const completed = inZone.filter(isClubReportingComplete).length;
    return {
      zone,
      eligible: inZone.length,
      completed,
      adminSubmitted: inZone.filter((row) => row.admin === "SUBMITTED").length,
      eventsSubmitted: inZone.filter((row) => row.events === "SUBMITTED").length,
      stillOpen: inZone.length - completed,
      completionPercent: completionPercent(completed, inZone.length),
    };
  });
}

export type DistrictDuesCounts = {
  clubsFullyMarkedPaid: number;
  clubsMarkedUnpaid: number;
  clubsNotMarked: number;
  /** Sum of amounts clubs typed on the admin report when they marked dues paid. Not an assessed ledger. */
  declaredAmountInr: number | null;
  declaredAmountAvailable: boolean;
};

export function summarizeDistrictDues(
  rows: Array<Pick<ClubReportInput, "active" | "districtDuesPaid"> & { declaredAmount: number | null }>
): DistrictDuesCounts {
  const active = rows.filter((row) => row.active);
  const paid = active.filter((row) => row.districtDuesPaid === "yes");
  const amounts = paid
    .map((row) => row.declaredAmount)
    .filter((amount): amount is number => typeof amount === "number" && Number.isFinite(amount));
  return {
    clubsFullyMarkedPaid: paid.length,
    clubsMarkedUnpaid: active.filter((row) => row.districtDuesPaid === "no").length,
    clubsNotMarked: active.filter((row) => row.districtDuesPaid == null).length,
    declaredAmountInr: amounts.length ? amounts.reduce((sum, amount) => sum + amount, 0) : null,
    declaredAmountAvailable: amounts.length > 0,
  };
}

export type CitationStatusInput = "ASSIGNED" | "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED";

export type CitationClubInput = {
  clubId: string;
  clubName: string;
  zone: string | null;
  assignments: Array<{
    status: CitationStatusInput;
    awardedPoints: number;
    definitionPoints: number;
  }>;
};

export type CitationStandingRow = {
  rank: number;
  clubId: string;
  clubName: string;
  zone: string | null;
  eligiblePoints: number;
  approvedPoints: number;
  pendingCount: number;
  rejectedCount: number;
  approvedCount: number;
  applicableCount: number;
  completionPercent: number | null;
};

/** Same tie rule as club citation standings: equal approved points share a rank. */
export function rankCitationStandings(clubs: CitationClubInput[]): CitationStandingRow[] {
  const scored = clubs.map((club) => {
    const applicableCount = club.assignments.length;
    const approved = club.assignments.filter((row) => row.status === "APPROVED");
    const approvedPoints = approved.reduce((sum, row) => sum + (row.awardedPoints > 0 ? row.awardedPoints : 0), 0);
    const eligiblePoints = club.assignments.reduce((sum, row) => sum + (row.definitionPoints > 0 ? row.definitionPoints : 0), 0);
    return {
      clubId: club.clubId,
      clubName: club.clubName,
      zone: club.zone,
      eligiblePoints,
      approvedPoints,
      pendingCount: club.assignments.filter((row) => row.status === "SUBMITTED").length,
      rejectedCount: club.assignments.filter((row) => row.status === "REJECTED").length,
      approvedCount: approved.filter((row) => row.awardedPoints > 0).length,
      applicableCount,
      completionPercent: completionPercent(
        approved.filter((row) => row.awardedPoints > 0).length,
        applicableCount
      ),
    };
  });

  scored.sort((a, b) => b.approvedPoints - a.approvedPoints || a.clubName.localeCompare(b.clubName));

  let rank = 0;
  return scored.map((entry, index) => {
    if (index === 0 || entry.approvedPoints < scored[index - 1]!.approvedPoints) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });
}

export type CommandAlert = {
  id: string;
  category: string;
  severity: "overdue" | "due_soon" | "pending";
  title: string;
  description: string;
  href: string;
};

export function buildCommandAlerts(input: {
  now: Date;
  closesAt: Date;
  periodLabel: string;
  incompleteClubs: Array<{ clubId: string; clubName: string; zone: string | null }>;
  pendingCitationReviews: number;
  districtDuesOpenClubs: number;
  riCitationOverdueClubs: number;
  riCitationDueSoonClubs: number;
  clubReportsHref: string;
  citationReviewHref: string;
  districtDuesHref: string;
}): CommandAlert[] {
  const alerts: CommandAlert[] = [];
  const windowClosed = input.now.getTime() > input.closesAt.getTime();
  const dueSoon = !windowClosed && input.closesAt.getTime() - input.now.getTime() <= DUE_SOON_MS;
  const incomplete = input.incompleteClubs.length;

  if (incomplete > 0 && windowClosed) {
    const names = input.incompleteClubs.slice(0, 5).map((club) => club.clubName).join(", ");
    alerts.push({
      id: "reporting-overdue",
      category: "Monthly reporting",
      severity: "overdue",
      title: `${incomplete} active ${incomplete === 1 ? "club has" : "clubs have"} not finished ${input.periodLabel}`,
      description: names
        ? `Both the admin report and the events report must be submitted. Includes ${names}${incomplete > 5 ? ", and others" : ""}.`
        : "Both the admin report and the events report must be submitted.",
      href: input.clubReportsHref,
    });
  } else if (incomplete > 0 && dueSoon) {
    alerts.push({
      id: "reporting-due-soon",
      category: "Monthly reporting",
      severity: "due_soon",
      title: `${incomplete} active ${incomplete === 1 ? "club is" : "clubs are"} still open for ${input.periodLabel}`,
      description: "The submission window closes within 3 days.",
      href: input.clubReportsHref,
    });
  } else if (incomplete > 0) {
    alerts.push({
      id: "reporting-open",
      category: "Monthly reporting",
      severity: "pending",
      title: `${incomplete} active ${incomplete === 1 ? "club has" : "clubs have"} not finished ${input.periodLabel}`,
      description: "The submission window is still open.",
      href: input.clubReportsHref,
    });
  }

  if (input.pendingCitationReviews > 0) {
    alerts.push({
      id: "citations-pending",
      category: "Citations",
      severity: "pending",
      title: `${input.pendingCitationReviews} citation ${input.pendingCitationReviews === 1 ? "submission is" : "submissions are"} waiting for review`,
      description: "Submitted club proofs that have not been approved or rejected.",
      href: input.citationReviewHref,
    });
  }

  if (input.districtDuesOpenClubs > 0 && windowClosed) {
    alerts.push({
      id: "district-dues-overdue",
      category: "District dues",
      severity: "overdue",
      title: `${input.districtDuesOpenClubs} active ${input.districtDuesOpenClubs === 1 ? "club has" : "clubs have"} not marked district dues paid`,
      description: `The ${input.periodLabel} reporting window has closed. This uses the club admin report flag, not a payment ledger.`,
      href: input.districtDuesHref,
    });
  }

  if (input.riCitationOverdueClubs > 0) {
    alerts.push({
      id: "ri-dues-citation-overdue",
      category: "RI dues citation",
      severity: "overdue",
      title: `${input.riCitationOverdueClubs} ${input.riCitationOverdueClubs === 1 ? "club is" : "clubs are"} past the RI dues citation due date`,
      description: "The citation is not approved. There is no separate RI dues payment ledger.",
      href: input.citationReviewHref,
    });
  } else if (input.riCitationDueSoonClubs > 0) {
    alerts.push({
      id: "ri-dues-citation-due-soon",
      category: "RI dues citation",
      severity: "due_soon",
      title: `${input.riCitationDueSoonClubs} ${input.riCitationDueSoonClubs === 1 ? "club has" : "clubs have"} an RI dues citation due within 3 days`,
      description: "The citation is not approved yet.",
      href: input.citationReviewHref,
    });
  }

  return alerts;
}
