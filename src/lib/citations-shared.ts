import { siteConfig } from "@/config/site";
import type {
  CitationAssignmentStatus,
  CitationCadence,
} from "@/generated/prisma/client";

export type PeriodFields = {
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
};

export type SerializedCitationDefinition = {
  id: string;
  title: string;
  description: string | null;
  points: number;
  cadence: CitationCadence;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; name: string | null };
  assignmentCount?: number;
};

export type SerializedCitationAssignment = {
  id: string;
  definitionId: string;
  clubId: string;
  cadence: CitationCadence;
  periodKey: string;
  periodLabel: string;
  year: number;
  month: number | null;
  quarter: number | null;
  rotaryYearLabel: string | null;
  dueDate: string | null;
  status: CitationAssignmentStatus;
  proofUrl: string | null;
  clubNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerComment: string | null;
  awardedPoints: number;
  definition: {
    id: string;
    title: string;
    points: number;
    cadence: CitationCadence;
    description: string | null;
  };
  club: { id: string; name: string; zone: string | null };
  reviewedBy?: { id: string; name: string | null } | null;
};

export type CitationStandingEntry = {
  rank: number;
  clubId: string;
  clubName: string;
  zone: string | null;
  totalPoints: number;
  approvedCount: number;
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getQuarter(month: number): number {
  return Math.ceil(month / 3);
}

export function buildPeriodKey(
  cadence: CitationCadence,
  fields: PeriodFields
): string {
  if (cadence === "MONTHLY") {
    if (!fields.year || !fields.month) {
      throw new Error("Monthly citations require year and month.");
    }
    return `${fields.year}-${fields.month}`;
  }
  if (cadence === "QUARTERLY") {
    if (!fields.year || !fields.quarter) {
      throw new Error("Quarterly citations require year and quarter.");
    }
    return `${fields.year}-Q${fields.quarter}`;
  }
  if (!fields.rotaryYearLabel) {
    throw new Error("Yearly citations require a Rotary year label.");
  }
  return fields.rotaryYearLabel;
}

export function validatePeriodForCadence(
  cadence: CitationCadence,
  fields: PeriodFields
): {
  year: number;
  month: number | null;
  quarter: number | null;
  rotaryYearLabel: string | null;
  periodKey: string;
} {
  if (cadence === "MONTHLY") {
    if (!fields.year || !fields.month) {
      throw new Error("Monthly period requires year and month (1–12).");
    }
    const periodKey = buildPeriodKey(cadence, fields);
    return {
      year: fields.year,
      month: fields.month,
      quarter: null,
      rotaryYearLabel: null,
      periodKey,
    };
  }

  if (cadence === "QUARTERLY") {
    if (!fields.year || !fields.quarter) {
      throw new Error("Quarterly period requires year and quarter (1–4).");
    }
    if (fields.quarter < 1 || fields.quarter > 4) {
      throw new Error("Quarter must be between 1 and 4.");
    }
    const periodKey = buildPeriodKey(cadence, fields);
    return {
      year: fields.year,
      month: null,
      quarter: fields.quarter,
      rotaryYearLabel: null,
      periodKey,
    };
  }

  const rotaryYearLabel = fields.rotaryYearLabel ?? siteConfig.rotaryYear;
  const periodKey = buildPeriodKey(cadence, { rotaryYearLabel });
  const startYear = parseInt(rotaryYearLabel.split("-")[0] ?? "", 10);
  return {
    year: Number.isFinite(startYear) ? startYear : new Date().getFullYear(),
    month: null,
    quarter: null,
    rotaryYearLabel,
    periodKey,
  };
}

export function resolvePeriodLabel(
  cadence: CitationCadence,
  fields: {
    year?: number;
    month?: number | null;
    quarter?: number | null;
    rotaryYearLabel?: string | null;
  }
): string {
  if (cadence === "MONTHLY" && fields.month && fields.year) {
    return `${MONTHS_SHORT[fields.month - 1] ?? "Month"} ${fields.year}`;
  }
  if (cadence === "QUARTERLY" && fields.quarter && fields.year) {
    return `Q${fields.quarter} ${fields.year}`;
  }
  if (cadence === "YEARLY") {
    return `RIY ${fields.rotaryYearLabel ?? siteConfig.rotaryYear}`;
  }
  return "—";
}

export function citationStatusLabel(status: CitationAssignmentStatus | string): string {
  const labels: Record<string, string> = {
    ASSIGNED: "Assigned",
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    EXPIRED: "Incomplete",
  };
  return labels[status] ?? status;
}

/** Strip leading "01. " style criteria numbers from display titles. */
export function formatCitationTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, "").trim() || title;
}

export function citationTitleSortKey(title: string): number {
  const match = title.match(/^(\d+)\./);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function isCitationPastDue(
  dueDate: string | Date | null | undefined,
  now: Date = new Date()
): boolean {
  if (!dueDate) return false;
  return now.getTime() > new Date(dueDate).getTime();
}

/** Past-due assignments that were never submitted/approved become Incomplete. */
export function effectiveCitationStatus(
  status: CitationAssignmentStatus | string,
  dueDate: string | Date | null | undefined,
  now: Date = new Date()
): CitationAssignmentStatus | string {
  if (
    isCitationPastDue(dueDate, now) &&
    (status === "ASSIGNED" ||
      status === "DRAFT" ||
      status === "REJECTED" ||
      status === "EXPIRED")
  ) {
    return "EXPIRED";
  }
  return status;
}

export function isCitationEditable(
  status: CitationAssignmentStatus | string,
  dueDate: string | Date | null | undefined,
  now: Date = new Date()
): boolean {
  const effective = effectiveCitationStatus(status, dueDate, now);
  return effective === "ASSIGNED" || effective === "DRAFT" || effective === "REJECTED";
}
