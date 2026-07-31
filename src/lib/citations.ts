import type {
  CitationAssignment,
  CitationAssignmentStatus,
  CitationCadence,
  CitationDefinition,
  Club,
  Prisma,
  User,
} from "@/generated/prisma/client";
import {
  OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
} from "@/lib/district-clubs-data";
import {
  type CitationStandingEntry,
  effectiveCitationStatus,
  resolvePeriodLabel,
  validatePeriodForCadence,
} from "@/lib/citations-shared";
import { prisma } from "@/lib/prisma";

export type {
  CitationStandingEntry,
  PeriodFields,
  SerializedCitationAssignment,
  SerializedCitationDefinition,
} from "@/lib/citations-shared";

export {
  buildPeriodKey,
  citationStatusLabel,
  effectiveCitationStatus,
  getQuarter,
  isCitationEditable,
  isCitationPastDue,
  resolvePeriodLabel,
  validatePeriodForCadence,
} from "@/lib/citations-shared";

type DefinitionWithCreator = CitationDefinition & {
  createdBy: Pick<User, "id" | "name">;
  _count?: { assignments: number };
};

type AssignmentWithRelations = CitationAssignment & {
  definition: Pick<CitationDefinition, "id" | "title" | "points" | "cadence" | "description">;
  club: Pick<Club, "id" | "name" | "zone">;
  reviewedBy?: Pick<User, "id" | "name"> | null;
};

export function serializeCitationDefinition(
  def: DefinitionWithCreator
) {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    points: def.points,
    cadence: def.cadence,
    isActive: def.isActive,
    createdAt: def.createdAt.toISOString(),
    createdBy: { id: def.createdBy.id, name: def.createdBy.name },
    assignmentCount: def._count?.assignments,
  };
}

export function serializeCitationAssignment(row: AssignmentWithRelations) {
  return {
    id: row.id,
    definitionId: row.definitionId,
    clubId: row.clubId,
    cadence: row.cadence,
    periodKey: row.periodKey,
    periodLabel: resolvePeriodLabel(row.cadence, row),
    year: row.year,
    month: row.month,
    quarter: row.quarter,
    rotaryYearLabel: row.rotaryYearLabel,
    dueDate: row.dueDate?.toISOString() ?? null,
    status: effectiveCitationStatus(row.status, row.dueDate) as typeof row.status,
    proofUrl: row.proofUrl,
    clubNotes: row.clubNotes,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewerComment: row.reviewerComment,
    awardedPoints: row.awardedPoints,
    definition: row.definition,
    club: row.club,
    reviewedBy: row.reviewedBy ?? null,
  };
}

export const assignmentInclude = {
  definition: {
    select: { id: true, title: true, points: true, cadence: true, description: true },
  },
  club: { select: { id: true, name: true, zone: true } },
  reviewedBy: { select: { id: true, name: true } },
} satisfies Prisma.CitationAssignmentInclude;

export type AssignCitationResult = {
  assignedCount: number;
  createdCount: number;
  alreadyAssignedCount: number;
};

export async function assignCitationToClubs(input: {
  definitionId: string;
  clubIds?: string[];
  assignAllClubs?: boolean;
  dueDate?: Date | null;
  period: ReturnType<typeof validatePeriodForCadence>;
  cadence: CitationCadence;
}): Promise<AssignCitationResult> {
  const definition = await prisma.citationDefinition.findUnique({
    where: { id: input.definitionId },
  });
  if (!definition) {
    throw new Error("Citation definition not found.");
  }
  if (!definition.isActive) {
    throw new Error("Cannot assign an inactive citation definition.");
  }
  if (definition.cadence !== input.cadence) {
    throw new Error("Period cadence must match the citation definition.");
  }

  let clubIds = input.clubIds ?? [];
  if (input.assignAllClubs) {
    const clubs = await prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      select: { id: true },
    });
    clubIds = clubs.map((c) => c.id);
  }

  if (clubIds.length === 0) {
    throw new Error("Select at least one club.");
  }

  const { definitionId, period, cadence } = input;
  const periodKey = period.periodKey;

  const existing = await prisma.citationAssignment.findMany({
    where: { definitionId, periodKey, clubId: { in: clubIds } },
    select: { clubId: true },
  });
  const existingIds = new Set(existing.map((row) => row.clubId));
  const newClubIds = clubIds.filter((id) => !existingIds.has(id));
  const alreadyAssignedCount = clubIds.length - newClubIds.length;

  let createdCount = 0;
  if (newClubIds.length > 0) {
    const created = await prisma.citationAssignment.createMany({
      data: newClubIds.map((clubId) => ({
        definitionId,
        clubId,
        cadence,
        periodKey,
        year: period.year,
        month: period.month,
        quarter: period.quarter,
        rotaryYearLabel: period.rotaryYearLabel,
        dueDate: input.dueDate ?? null,
        status: "ASSIGNED" as const,
      })),
      skipDuplicates: true,
    });
    createdCount = created.count;
  }

  if (alreadyAssignedCount > 0 && input.dueDate != null) {
    await prisma.citationAssignment.updateMany({
      where: {
        definitionId,
        periodKey,
        clubId: { in: clubIds.filter((id) => existingIds.has(id)) },
      },
      data: { dueDate: input.dueDate },
    });
  }

  return {
    assignedCount: clubIds.length,
    createdCount,
    alreadyAssignedCount,
  };
}

export function buildStandingsWhere(filters: {
  cadence?: CitationCadence;
  periodKey?: string;
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
}): Prisma.CitationAssignmentWhereInput {
  const where: Prisma.CitationAssignmentWhereInput = {
    status: "APPROVED",
    awardedPoints: { gt: 0 },
  };

  if (filters.cadence) where.cadence = filters.cadence;

  if (filters.periodKey) {
    where.periodKey = filters.periodKey;
    return where;
  }

  if (!filters.cadence) return where;

  const period = validatePeriodForCadence(filters.cadence, {
    year: filters.year,
    month: filters.month,
    quarter: filters.quarter,
    rotaryYearLabel: filters.rotaryYearLabel,
  });

  where.periodKey = period.periodKey;
  return where;
}

export type CitationStandingsPeriodHint = {
  cadence: CitationCadence;
  periodKey: string;
  periodLabel: string;
  year: number;
  month: number | null;
  quarter: number | null;
  rotaryYearLabel: string | null;
  totalPoints: number;
  approvedCount: number;
};

export async function getApprovedCitationPeriods(): Promise<CitationStandingsPeriodHint[]> {
  const rows = await prisma.citationAssignment.groupBy({
    by: ["cadence", "periodKey", "year", "month", "quarter", "rotaryYearLabel"],
    where: { status: "APPROVED", awardedPoints: { gt: 0 } },
    _sum: { awardedPoints: true },
    _count: { id: true },
  });

  return rows
    .map((row) => ({
      cadence: row.cadence,
      periodKey: row.periodKey,
      periodLabel: resolvePeriodLabel(row.cadence, row),
      year: row.year,
      month: row.month,
      quarter: row.quarter,
      rotaryYearLabel: row.rotaryYearLabel,
      totalPoints: row._sum.awardedPoints ?? 0,
      approvedCount: row._count.id,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function getClubCitationStandings(filters: {
  cadence?: CitationCadence;
  periodKey?: string;
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
  limit?: number;
}): Promise<CitationStandingEntry[]> {
  const where = buildStandingsWhere(filters);

  const [clubs, aggregates] = await Promise.all([
    prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      select: { id: true, name: true, zone: true },
      orderBy: { name: "asc" },
    }),
    prisma.citationAssignment.groupBy({
      by: ["clubId"],
      where,
      _sum: { awardedPoints: true },
      _count: { id: true },
    }),
  ]);

  const byClub = Object.fromEntries(
    aggregates.map((row) => [
      row.clubId,
      { totalPoints: row._sum.awardedPoints ?? 0, approvedCount: row._count.id },
    ])
  );

  const ranked = clubs
    .map((club) => ({
      clubId: club.id,
      clubName: club.name,
      zone: club.zone,
      totalPoints: byClub[club.id]?.totalPoints ?? 0,
      approvedCount: byClub[club.id]?.approvedCount ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.clubName.localeCompare(b.clubName));

  let rank = 0;
  const finalRanked: CitationStandingEntry[] = ranked.map((entry, index) => {
    if (index === 0 || entry.totalPoints < ranked[index - 1]!.totalPoints) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });

  const limit = filters.limit ?? finalRanked.length;
  return finalRanked.slice(0, limit);
}

export function buildAssignmentsWhereFromQuery(query: {
  status?: CitationAssignmentStatus;
  clubId?: string;
  definitionId?: string;
  cadence?: CitationCadence;
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
}): Prisma.CitationAssignmentWhereInput {
  const where: Prisma.CitationAssignmentWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.clubId) where.clubId = query.clubId;
  if (query.definitionId) where.definitionId = query.definitionId;
  if (query.cadence) {
    where.cadence = query.cadence;
    if (query.year || query.month || query.quarter || query.rotaryYearLabel) {
      const period = validatePeriodForCadence(query.cadence, {
        year: query.year,
        month: query.month,
        quarter: query.quarter,
        rotaryYearLabel: query.rotaryYearLabel,
      });
      where.periodKey = period.periodKey;
    }
  }
  return where;
}
